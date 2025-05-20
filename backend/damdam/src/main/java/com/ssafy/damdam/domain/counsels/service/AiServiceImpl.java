package com.ssafy.damdam.domain.counsels.service;

import static com.ssafy.damdam.domain.counsels.exception.CounsExceptionCode.*;
import static com.ssafy.damdam.domain.users.exception.user.UserExceptionCode.*;
import static com.ssafy.damdam.global.redis.exception.RedisExceptionCode.*;

import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.dto.ChatMessageDto;
import com.ssafy.damdam.domain.counsels.dto.EmotionDto;
import com.ssafy.damdam.domain.counsels.dto.LlmAiChatRequest;
import com.ssafy.damdam.domain.counsels.dto.LlmAiChatResponse;
import com.ssafy.damdam.domain.counsels.dto.LlmSummaryRequest;
import com.ssafy.damdam.domain.counsels.dto.LlmSummaryResponse;
import com.ssafy.damdam.domain.counsels.dto.UserContextDto;
import com.ssafy.damdam.domain.counsels.entity.Counseling;
import com.ssafy.damdam.domain.counsels.exception.CounsException;
import com.ssafy.damdam.domain.counsels.repository.CounselingRepository;
import com.ssafy.damdam.domain.users.entity.Age;
import com.ssafy.damdam.domain.users.entity.Gender;
import com.ssafy.damdam.domain.users.entity.Mbti;
import com.ssafy.damdam.domain.users.entity.UserInfo;
import com.ssafy.damdam.domain.users.entity.UserSetting;
import com.ssafy.damdam.domain.users.entity.UserSurvey;
import com.ssafy.damdam.domain.users.exception.user.UserException;
import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import com.ssafy.damdam.domain.users.repository.UserSurveyRepository;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;
import com.ssafy.damdam.global.redis.CounselSession;
import com.ssafy.damdam.global.redis.CounselSessionRepository;
import com.ssafy.damdam.global.redis.exception.RedisException;
import com.ssafy.damdam.global.webclient.client.AnalyzeAudioClient;
import com.ssafy.damdam.global.webclient.client.AnalyzeTextClient;
import com.ssafy.damdam.global.webclient.client.LlmChatClient;
import com.ssafy.damdam.global.webclient.client.LlmPeriodClient;
import com.ssafy.damdam.global.webclient.client.LlmSummaryClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiServiceImpl implements AiService {

	private final UserSettingRepository settingRepository;
	private final UserInfoRepository infoRepository;
	private final UserSurveyRepository surveyRepository;
	private final AnalyzeAudioClient analyzeAudioClient;
	private final AnalyzeTextClient analyzeTextClient;
	private final LlmChatClient llmChatClient;
	private final LlmSummaryClient llmSummaryClient;
	private final LlmPeriodClient llmPeriodClient;
	private final RedisTemplate<String, Object> redisTemplate;
	private final CounselSessionRepository sessionRepository;
	private final S3FileUploadService s3FileUploadService;
	private final CounselingRepository counselingRepository;
	private final ObjectMapper objectMapper;

	// 값이 없거나 특정되지 않은 경우 null화 하는 함수
	private String normalizeEnumValue(String v) {
		if (v == null || v.isBlank() || "UNKNOWN".equalsIgnoreCase(v))
			return null;
		return v.trim();
	}

	@Override
	@Transactional
	public EmotionDto analyzeAudio(Long roomId, Long userId, int messageOrder, String audioUrl) {
		return analyzeAudioClient.analyzeAudio(audioUrl);
	}

	@Override
	public EmotionDto analyzingText(String message) {
		return analyzeTextClient.analyzeText(message);
	}

	@Override
	public LlmAiChatResponse chatWithLlm(
		Long roomId,
		Long userId,
		String nickname,
		ChatInputDto input,
		EmotionDto emotion
	) {

		CounselSession session = sessionRepository.findById(roomId)
			.orElseThrow(() -> new RedisException(REDIS_SESSION_NOT_FOUND));

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
			.nickname(nickname)
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

		LlmAiChatRequest request = LlmAiChatRequest.builder()
			.messageInput(input)
			.userContext(userContext)
			.emotion(emotion)
			.build();

		return llmChatClient.requestChatResponse(request);
	}

	@Override
	@Transactional
	public LlmSummaryResponse getSessionReport(Long counsId) throws JsonProcessingException {

		CounselSession session = sessionRepository.findById(counsId)
			.orElseThrow(() -> new RedisException(REDIS_SESSION_NOT_FOUND));

		String listKey = "counsel:" + counsId + ":messages";
		List<Object> rawList = redisTemplate.opsForList().range(listKey, 0, -1);
		List<ChatMessageDto> messages = rawList == null
			? List.of()
			: rawList.stream()
			.map(item -> objectMapper.convertValue(item, ChatMessageDto.class))
			.toList();

		LlmSummaryRequest request = LlmSummaryRequest.builder()
			.counsId(counsId)
			.userId(session.getUserId())
			.messageList(messages)
			.build();

		LlmSummaryResponse llmResponse = llmSummaryClient.requestSummary(request);

		String s3Url = s3FileUploadService.uploadFullText(request);
		log.info("uploaded full chatting s3 url: {}", s3Url);
		// 4. counseling entity에 s3url update
		Counseling counseling = counselingRepository.findById(counsId)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		counseling.updateS3Link(s3Url);

		// 5. DTO 반환

		return llmResponse;
	}

}
