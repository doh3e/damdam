package com.ssafy.damdam.domain.reports.service;

import static com.ssafy.damdam.domain.reports.exception.ReportExceptionCode.*;
import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;
import static com.ssafy.damdam.domain.users.exception.user.UserExceptionCode.*;
import static com.ssafy.damdam.global.webclient.exception.WebClientExceptionCode.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.ChatRecordDto;
import com.ssafy.damdam.domain.counsels.dto.CounselingDto;
import com.ssafy.damdam.domain.counsels.dto.EmotionDto;
import com.ssafy.damdam.domain.counsels.dto.TranscriptDto;
import com.ssafy.damdam.domain.counsels.dto.UserContextDto;
import com.ssafy.damdam.domain.counsels.entity.Counseling;
import com.ssafy.damdam.domain.counsels.repository.CounselingRepository;
import com.ssafy.damdam.domain.reports.dto.EmotionPerTimestamp;
import com.ssafy.damdam.domain.reports.dto.LlmPeriodReportRequest;
import com.ssafy.damdam.domain.reports.dto.LlmPeriodReportResponse;
import com.ssafy.damdam.domain.reports.dto.PeriodReportInputDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportListDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportListDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SparkResponseDto;
import com.ssafy.damdam.domain.reports.dto.SparkResultDto;
import com.ssafy.damdam.domain.reports.entity.PeriodReport;
import com.ssafy.damdam.domain.reports.entity.SessionReport;
import com.ssafy.damdam.domain.reports.exception.ReportException;
import com.ssafy.damdam.domain.reports.repository.PeriodReportRepository;
import com.ssafy.damdam.domain.reports.repository.SessionReportRepository;
import com.ssafy.damdam.domain.users.entity.Age;
import com.ssafy.damdam.domain.users.entity.Gender;
import com.ssafy.damdam.domain.users.entity.Mbti;
import com.ssafy.damdam.domain.users.entity.UserInfo;
import com.ssafy.damdam.domain.users.entity.UserSetting;
import com.ssafy.damdam.domain.users.entity.UserSurvey;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.domain.users.exception.user.UserException;
import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import com.ssafy.damdam.domain.users.repository.UserSurveyRepository;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;
import com.ssafy.damdam.global.util.user.UserUtil;
import com.ssafy.damdam.global.webclient.client.LlmPeriodClient;
import com.ssafy.damdam.global.webclient.client.SparkPeriodClient;
import com.ssafy.damdam.global.webclient.exception.WebClientException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

	private final PeriodReportRepository periodReportRepository;
	private final SessionReportRepository sessionReportRepository;
	private final CounselingRepository counselingRepository;
	private final UserSettingRepository settingRepository;
	private final UserInfoRepository infoRepository;
	private final UserSurveyRepository surveyRepository;
	private final S3FileUploadService s3FileUploadService;
	private final LlmPeriodClient llmClient;
	private final SparkPeriodClient sparkClient;
	private final ObjectMapper objectMapper;
	private final UserUtil userUtil;

	// 유저 검증 메서드
	private Users validateUser() {
		Users user = userUtil.getUser();
		if (user == null) {
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		return user;
	}

	// 세션별 레포트 존재 여부 및 권한 검증 메서드
	private SessionReport validateSessionReport(Long reportId) {
		SessionReport report = sessionReportRepository.findById(reportId)
			.orElseThrow(() -> new ReportException(REPORT_NOT_FOUND));

		if (!report.getCounseling().getUsers().getUserId().equals(userUtil.getUser().getUserId())) {
			throw new ReportException(NOT_YOUR_REPORT);
		}
		return report;
	}

	// 기간별 레포트 존재 여부 및 권한 검증 메서드
	private PeriodReport validatePeriodReport(Long reportId) {
		PeriodReport report = periodReportRepository.findById(reportId)
			.orElseThrow(() -> new ReportException(REPORT_NOT_FOUND));

		if (!report.getUsers().getUserId().equals(userUtil.getUser().getUserId())) {
			throw new ReportException(NOT_YOUR_REPORT);
		}
		return report;
	}

	// 값이 없거나 특정되지 않은 경우 null화 하는 함수
	private String normalizeEnumValue(String v) {
		if (v == null || v.isBlank() || "UNKNOWN".equalsIgnoreCase(v))
			return null;
		return v.trim();
	}

	private boolean isBlank(String s) {
		return s == null || s.isBlank();
	}

	private LocalDate parseDate(String raw) {
		if (isBlank(raw))
			return null;
		return LocalDate.parse(raw, DateTimeFormatter.ofPattern("yyyyMMdd"));
	}

	@Override
	public List<SessionReportListDto> getSReportList(
		String startDate, String endDate, String keyword) {
		Users user = validateUser();

		LocalDate start = parseDate(startDate);
		LocalDate end = parseDate(endDate);

		List<SessionReport> reports = sessionReportRepository
			.findByFilter(user, start, end, keyword);

		return reports.stream()
			.map(r -> {
				var counseling = r.getCounseling();
				return SessionReportListDto.builder()
					.sReportId(r.getSReportId())
					.sReportTitle(r.getSReportTitle())
					.counsId(counseling.getCounsId())
					.createdAt(r.getCreatedAt())
					.build();
			})
			.collect(Collectors.toList());
	}

	@Override
	public List<PeriodReportListDto> getPReportList(
		String startDate, String endDate, String keyword) {
		Users user = validateUser();

		LocalDate start = parseDate(startDate);
		LocalDate end = parseDate(endDate);

		return periodReportRepository.findByFilter(user, start, end, keyword)
			.stream()
			.map(p -> PeriodReportListDto.builder()
				.pReportId(p.getPReportId())
				.pReportTitle(p.getPReportTitle())
				.startDate(p.getStartDate())
				.endDate(p.getEndDate())
				.createdAt(p.getCreatedAt())
				.build()
			)
			.collect(Collectors.toList());
	}

	@Override
	public SessionReportOutputDto getSessionReport(Long reportId) {
		Users user = validateUser();
		SessionReport report = validateSessionReport(reportId);

		TranscriptDto transcript = s3FileUploadService.downloadTranscript(report.getCounseling().getS3Link());
		Map<Integer, EmotionDto> emotionMap = transcript.getMessageList().stream()
			.filter(r -> r.getEmotion() != null)                        // AI가 분석해준 것
			.collect(Collectors.toMap(
				ChatRecordDto::getMessageOrder,
				ChatRecordDto::getEmotion,
				(e1, e2) -> e1   // 혹시 중복 key 면 첫 값 유지
			));

		List<EmotionPerTimestamp> emotionList = transcript.getMessageList().stream()
			.filter(r -> "USER".equals(r.getSender()))
			.map(r -> {
				EmotionDto emo = emotionMap.get(r.getMessageOrder());
				if (emo == null)
					return null;
				return EmotionPerTimestamp.builder()
					.timestamp(r.getTimestamp())
					.messageOrder(r.getMessageOrder())
					.emotion(emo)
					.build();
			})
			.filter(Objects::nonNull)
			.toList();

		return SessionReportOutputDto.builder()
			.sReportId(report.getSReportId())
			.sReportTitle(report.getSReportTitle())
			.userId(report.getCounseling().getUsers().getUserId())
			.nickname(report.getCounseling().getUsers().getNickname())
			.counsId(report.getCounseling().getCounsId())
			.counsTitle(report.getCounseling().getCounsTitle())
			.summary(report.getSummary())
			.analyze(report.getAnalyze())
			.valence(report.getValence())
			.arousal(report.getArousal())
			.emotionList(emotionList)
			.createdAt(report.getCreatedAt())
			.build();
	}

	@Override
	@Transactional
	public void updateSessionReportTitle(Long reportId, String sessionReportTitle) {
		Users user = validateUser();

		SessionReport report = validateSessionReport(reportId);

		report.updateSReport(sessionReportTitle);
	}

	@Override
	@Transactional
	public void deleteSessionReport(Long reportId) {
		Users user = validateUser();

		SessionReport report = validateSessionReport(reportId);

		sessionReportRepository.delete(report);
	}

	@Override
	public PeriodReportOutputDto getPeriodReport(Long pReportId) {
		Users user = validateUser();

		PeriodReport report = validatePeriodReport(pReportId);

		// 리스트를 통한 상담 목록 만들기
		List<Long> counselIds = report.getCounselList();  // [1,2,3] 같은 형태
		List<CounselingDto> counselingDtoList;

		if (counselIds.isEmpty()) {
			counselingDtoList = List.of();
		} else {
			List<Counseling> counselings = counselingRepository.findAllById(counselIds);

			Map<Long, Counseling> map = counselings.stream()
				.collect(Collectors.toMap(Counseling::getCounsId, Function.identity()));

			counselingDtoList = counselIds.stream()
				.map(map::get)
				.filter(Objects::nonNull)
				.map(CounselingDto::fromEntity)
				.toList();
		}

		return PeriodReportOutputDto.builder()
			.pReportId(report.getPReportId())
			.pReportTitle(report.getPReportTitle())
			.startDate(report.getStartDate())
			.endDate(report.getEndDate())
			.counselings(counselingDtoList)
			.advice(report.getAdvice())
			.compliment(report.getCompliment())
			.summary(report.getSummary())
			.worry(report.getWorry())
			.counselTime(report.getCounselTime())
			.createdAt(report.getCreatedAt())
			.build();
	}

	@Override
	@Transactional
	public void updatePeriodReportTitle(Long pReportId, String pReportTitle) {
		Users user = validateUser();
		PeriodReport report = validatePeriodReport(pReportId);
		report.updatePReport(pReportTitle);
	}

	@Override
	@Transactional
	public void deletePeriodReport(Long pReportId) {
		Users user = validateUser();
		PeriodReport report = validatePeriodReport(pReportId);
		periodReportRepository.delete(report);
	}

	@Override
	@Transactional
	public Long createPeriodReport(PeriodReportInputDto periodReportInputDto) {
		Users user = validateUser();
		Long userId = user.getUserId();

		String startDate = periodReportInputDto.getStartDate();
		String endDate = periodReportInputDto.getEndDate();
		DateTimeFormatter formatter = DateTimeFormatter.BASIC_ISO_DATE;
		LocalDate start = LocalDate.parse(startDate, formatter);
		LocalDate end = LocalDate.parse(endDate, formatter);

		LocalDateTime startAt = start.atStartOfDay();             // 00:00:00
		LocalDateTime endAt = end.atTime(LocalTime.MAX);
		
		long validCount = counselingRepository.countValidCounselings(userId, startAt, endAt);

		if (validCount < 2) {
			throw new ReportException(CANT_CREATE_PERIOD_REPORT);
		}

		SparkResponseDto rawResp = sparkClient.getRawResults(
			userId, start, end
		);

		if (rawResp.getCount() == 0) {
			throw new ReportException(CANT_CREATE_PERIOD_REPORT);
		}

		List<SparkResultDto> processed = rawResp.getResults().stream()
			.map(raw -> {
				try {
					EmotionDto emo = objectMapper.readValue(raw.getEmotion(), EmotionDto.class);
					LocalDateTime kstTime = Instant
						.parse(raw.getTimestamp())
						.atZone(ZoneId.of("Asia/Seoul"))
						.toLocalDateTime();

					return SparkResultDto.builder()
						.counsId(Long.parseLong(raw.getCounsId()))
						.userId(Long.parseLong(raw.getUserId()))
						.timestamp(kstTime)
						.message(raw.getMessage())
						.emotion(emo)
						.build();
				} catch (JsonProcessingException e) {
					throw new WebClientException(SPARK_API_ERROR);
				}
			})
			.toList();

		// DB에 저장할 상담 목록 리스트
		List<Long> counselList = processed.stream()
			.map(SparkResultDto::getCounsId)
			.distinct()
			.toList();

		// LLM 요청을 위한 유저 컨텍스트
		UserInfo infos = infoRepository.findById(userId)
			.orElseThrow(() -> new UserException(USER_INFO_NOT_FOUND));
		UserSetting setting = settingRepository.findById(userId)
			.orElseThrow(() -> new UserException(USER_SETTING_NOT_FOUND));

		UserSurvey survey = surveyRepository.findById(userId).orElse(null);
		int depression = -1, anxiety = -1, stress = -1;
		Boolean isSuicidal = null;
		String stressReason = null;

		if (survey != null) {
			depression = survey.getDepression();
			anxiety = survey.getAnxiety();
			stress = survey.getStress();
			isSuicidal = survey.getIsSuicidal();
			stressReason = normalizeEnumValue(survey.getStressReason());
		}

		String rawAge = normalizeEnumValue(String.valueOf(infos.getAge()));
		Age ageEnum = rawAge != null ? Age.valueOf(rawAge) : null;

		String rawMbti = normalizeEnumValue(String.valueOf(infos.getMbti()));
		Mbti mbtiEnum = rawMbti != null ? Mbti.valueOf(rawMbti) : null;

		String rawGender = normalizeEnumValue(String.valueOf(infos.getGender()));
		Gender genderEnum = rawGender != null ? Gender.valueOf(rawGender) : null;

		UserContextDto userContext = UserContextDto.builder()
			.nickname(user.getNickname())
			.botCustom(normalizeEnumValue(setting.getBotCustom()))
			.age(ageEnum)   // Age enum or null
			.mbti(mbtiEnum)   // Mbti enum or null
			.career(normalizeEnumValue(infos.getCareer()))
			.gender(genderEnum)   // Gender enum or null
			.depression(depression)
			.anxiety(anxiety)
			.stress(stress)
			.isSuicidal(isSuicidal)
			.stressReason(stressReason)
			.build();

		LlmPeriodReportRequest llmRequest = LlmPeriodReportRequest.builder()
			.userContext(userContext)
			.startDate(start)
			.endDate(end)
			.userContext(userContext)
			.messageList(processed)
			.build();

		LlmPeriodReportResponse response = llmClient.requestPeriodReport(llmRequest);

		PeriodReport report = new PeriodReport();
		report.createPeriodReport(
			user,
			start,
			end,
			processed.size(),
			counselList,
			response
		);
		periodReportRepository.save(report);

		return report.getPReportId();
	}
}
