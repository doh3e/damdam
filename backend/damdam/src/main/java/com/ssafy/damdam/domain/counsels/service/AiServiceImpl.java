package com.ssafy.damdam.domain.counsels.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.*;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.users.entity.*;
import com.ssafy.damdam.domain.users.exception.user.UserException;
import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import com.ssafy.damdam.domain.users.repository.UserSurveyRepository;
import com.ssafy.damdam.global.redis.CounselSession;
import com.ssafy.damdam.global.redis.CounselSessionRepository;
import com.ssafy.damdam.global.webclient.client.AnalyzeAudioClient;

import com.ssafy.damdam.global.webclient.client.AnalyzeTextClient;
import com.ssafy.damdam.global.webclient.client.LlmChatClient;
import com.ssafy.damdam.global.webclient.client.LlmSummaryClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;

import static com.ssafy.damdam.domain.users.exception.user.UserExceptionCode.USER_INFO_NOT_FOUND;
import static com.ssafy.damdam.domain.users.exception.user.UserExceptionCode.USER_SETTING_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiServiceImpl implements AiService {

	private final UserSettingRepository settingRepository;
	private final UserInfoRepository infoRepository;
	private final UserSurveyRepository surveyRepository;
	private final ExecutorService virtualThreadExecutor;
	private final AnalyzeAudioClient analyzeAudioClient;
	private final AnalyzeTextClient analyzeTextClient;
	private final LlmChatClient llmChatClient;
	private final LlmSummaryClient llmSummaryClient;
	private final RedisTemplate<String, Object> redisTemplate;
	private final CounselSessionRepository sessionRepository;
	private final ObjectMapper objectMapper;
	private final SimpMessagingTemplate messagingTemplate;


	// 값이 없거나 특정되지 않은 경우 null화 하는 함수
	private String normalizeEnumValue(String v) {
		if (v == null || v.isBlank() || "UNKNOWN".equalsIgnoreCase(v)) return null;
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
			ChatInputDto input
	) {

		CounselSession session = sessionRepository.findById(roomId)
				.orElseThrow(() -> new IllegalStateException("세션이 없습니다: " + roomId));

		UserInfo infos = infoRepository.findById(userId)
				.orElseThrow(() -> new UserException(USER_INFO_NOT_FOUND));
		UserSetting setting = settingRepository.findById(userId)
				.orElseThrow(() -> new UserException(USER_SETTING_NOT_FOUND));
		// survey 처리
		UserSurvey survey = surveyRepository.findById(userId).orElse(null);
		int depression = -1, anxiety = -1, stress = -1;
		Boolean isSuicidal = null;
		String stressReason = null;

		if (survey != null) {
			depression   = survey.getDepression();
			anxiety      = survey.getAnxiety();
			stress       = survey.getStress();
			isSuicidal   = survey.getIsSuicidal();
			stressReason = normalizeEnumValue(survey.getStressReason());
		}

		// enum 필드 변환 전 null 체크
		String rawAge    = normalizeEnumValue(String.valueOf(infos.getAge()));
		Age    ageEnum   = rawAge    != null ? Age.valueOf(rawAge) : null;

		String rawMbti   = normalizeEnumValue(String.valueOf(infos.getMbti()));
		Mbti   mbtiEnum  = rawMbti   != null ? Mbti.valueOf(rawMbti) : null;

		String rawGender = normalizeEnumValue(String.valueOf(infos.getGender()));
		Gender genderEnum = rawGender != null ? Gender.valueOf(rawGender) : null;

		UserContextDto userContext = UserContextDto.builder()
				.botCustom( normalizeEnumValue(setting.getBotCustom()) )
				.age(      ageEnum      )   // Age enum or null
				.mbti(     mbtiEnum     )   // Mbti enum or null
				.career(   normalizeEnumValue(infos.getCareer()) )
				.gender(   genderEnum   )   // Gender enum or null
				.depression(depression)
				.anxiety(  anxiety)
				.stress(   stress)
				.isSuicidal(isSuicidal)
				.stressReason(stressReason)
				.build();

		LlmAiChatRequestDto request = LlmAiChatRequestDto.builder()
				.chatInputDto(input)
				.userContextDto(userContext)
				.build();

		log.info("chatwithllm service request: {}", request);
		return llmChatClient.requestChatResponse(request);
	}

	@Override
	public SessionReportOutputDto getSessionReport(Long counsId) {

		return null;
	}

}
