package com.ssafy.damdam.domain.counsels.service;

import static com.ssafy.damdam.domain.counsels.exception.CounsExceptionCode.*;
import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.*;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.ssafy.damdam.domain.counsels.entity.Counseling;
import com.ssafy.damdam.domain.counsels.exception.CounsException;
import com.ssafy.damdam.domain.counsels.repository.CounselingRepository;
import com.ssafy.damdam.domain.reports.entity.SessionReport;
import com.ssafy.damdam.domain.reports.repository.SessionReportRepository;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.global.util.user.UserUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CounselServiceImpl implements CounselService {

	private final CounselingRepository counselingRepository;
	private final RedisTemplate<String, Object> redisTemplate;
	private final UserUtil userUtil;
	private final AiService aiService;
	private final SessionReportRepository sessionReportRepository;
	private final ObjectMapper objectMapper;
	private final S3FileUploadService s3FileUploadService;

	// 유저 검증 메서드
	private Users validateUser() {
		Users user = userUtil.getUser();
		if (user == null) {
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		return user;
	}

	@Override
	public List<CounselingDto> getCounselList() {

		Users user = validateUser();
		List<Counseling> counsList =
			counselingRepository.findAllByUsers_UserIdOrderByCreatedAtDesc(user.getUserId());

		return counsList.stream()
			.map(CounselingDto::fromEntity)
			.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public Long createCounsel() {
		Users user = validateUser();
		Counseling saved = counselingRepository.save(new Counseling(user));

		return saved.getCounsId();
	}

	@Override
	public CounselingChatListDto getCounsel(Long counsId) {
		Users user = validateUser();
		Counseling counseling = counselingRepository.findById(counsId)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		if (!counseling.getUsers().getUserId().equals(user.getUserId())) {
			throw new CounsException(NOT_YOUR_COUNSEL);
		}

		CounselingChatListDto.CounselingChatListDtoBuilder dtoBuilder = CounselingChatListDto.builder()
				.counsId(counsId)
				.counsTitle(counseling.getCounsTitle())
				.createdAt(counseling.getCreatedAt())
				.updatedAt(counseling.getUpdatedAt())
				.isClosed(counseling.getIsClosed());

		List<ChatOutputDto> messageList = Collections.emptyList();

		// 세션이 닫혔는지 여부에 따라 대화내역 불러올 곳이 달라짐
		if (counseling.getIsClosed()) {
			String s3Link = counseling.getS3Link();
			TranscriptDto transcript = s3FileUploadService.downloadTranscript(s3Link);

			messageList = transcript.getMessageList().stream()
					.map(r -> ChatOutputDto.builder()
							.sender(r.getSender())
							.message(r.getMessage())
							.timestamp(r.getTimestamp())
							.messageOrder(r.getMessageOrder())
							.tokenCount(null)  // 필요 시 null 또는 값
							.build())
					.toList();
		} else {
			String listKey = "counsel:" + counsId + ":messages";
			List<Object> raw = redisTemplate.opsForList().range(listKey, 0, -1);
			List<ChatRecordDto> records = raw == null
					? List.of()
					: raw.stream()
					.map(item -> objectMapper.convertValue(item, ChatRecordDto.class))
					.toList();

			messageList = records.stream()
					.map(r -> ChatOutputDto.builder()
							.sender(r.getSender())
							.message(r.getMessage())
							.timestamp(r.getTimestamp())
							.tokenCount(null)
							.messageOrder(r.getMessageOrder())
							.build())
					.toList();
		}

		return dtoBuilder
				.messageList(messageList)
				.build();
	}

	@Override
	@Transactional
	public void patchCounsel(Long counsId, String counsTitle) {

		Users user = validateUser();
		Counseling counseling = counselingRepository.findById(counsId)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		if (!counseling.getUsers().getUserId().equals(user.getUserId())) {
			throw new CounsException(NOT_YOUR_COUNSEL);
		}

		counseling.updateCounsel(counsTitle);
	}

	@Override
	@Transactional
	public void deleteCounsel(Long counsId) {
		Users user = validateUser();
		Counseling counseling = counselingRepository.findById(counsId)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		if (!counseling.getUsers().getUserId().equals(user.getUserId())) {
			throw new CounsException(NOT_YOUR_COUNSEL);
		}

		if (counseling.getS3Link() != null || !counseling.getS3Link().isBlank()) {
			s3FileUploadService.deleteTranscript(counseling.getS3Link());
		}

		counselingRepository.delete(counseling);
	}

	@Override
	@Transactional
	public void closeCounsel(Long counsId) {
		Users user = validateUser();
		Counseling counseling = counselingRepository.findById(counsId)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		if (!counseling.getUsers().getUserId().equals(user.getUserId())) {
			throw new CounsException(NOT_YOUR_COUNSEL);
		}

		counseling.updateCounsel(counseling.getCounsTitle());
		counseling.setClosed(true);

	}

	@Override
	@Transactional
	public Long reportCounsel(Long counsId) throws JsonProcessingException {

		SessionReport sReport = sessionReportRepository.findByCounseling_CounsId(counsId)
			.orElse(null);

		if (sReport != null) {
			return sReport.getSReportId();
		}

		LlmSummaryResponse response = aiService.getSessionReport(counsId);

		Counseling counseling = counselingRepository.findById(counsId)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		SessionReport sessionReport = SessionReport.of(
			counseling,
			response.getSummary(),
			response.getAnalyze(),
			response.getArousal(),
			response.getValence()
		);

		sessionReportRepository.save(sessionReport);

		return sessionReport.getSReportId();

	}
}
