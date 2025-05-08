package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.AudioAiResponse;
import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.dto.ChatOutputDto;
import com.ssafy.damdam.domain.users.dto.user.UserContextDto;
import com.ssafy.damdam.domain.users.entity.UserInfo;
import com.ssafy.damdam.domain.users.entity.UserSetting;
import com.ssafy.damdam.domain.users.entity.UserSurvey;
import com.ssafy.damdam.domain.users.exception.user.UserException;
import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import com.ssafy.damdam.domain.users.repository.UserSurveyRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

import static com.ssafy.damdam.domain.users.exception.user.UserExceptionCode.USER_INFO_NOT_FOUND;
import static com.ssafy.damdam.domain.users.exception.user.UserExceptionCode.USER_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiServiceImpl implements AiService{

	private final RestClient restClient;
	private final UserSettingRepository settingRepo;
	private final UserInfoRepository infoRepo;
	private final UserSurveyRepository surveyRepo;


	@Value("${fastapi.llm.base-url}")
	private String fastApiLLMUrl;

	@Value("${fastapi.audio.base-url}")
	private String fastApiAudioUrl;


//	@Override
//	public ChatOutputDto analyzeAndRespond(Long roomId,
//										   Long userId,
//										   ChatInputDto input,
//										   int remainingTokens) {
//
//		// 사용자 맞춤 컨텍스트 로드
//		UserContextDto userCtx = loadUserContext(userId);
//
//
//		// 음성 존재시 음성 분석
//		AudioAiResponse audioRes = null;
//		if (Boolean.TRUE.equals(input.getIsVoice()) && input.getAudioUrl() != null) {
//			audioRes = callAudioService(input.getAudioUrl());
//		}
//
//
//
//
//
//
//		return null;
//	}
//
//	private UserContextDto loadUserContext(Long userId) {
//
//		UserSetting setting = settingRepo.findById(userId)
//			.orElseThrow(() -> new UserException(USER_NOT_FOUND));
//
//		UserInfo info = infoRepo.findById(userId)
//			.orElseThrow(() -> new UserException(USER_INFO_NOT_FOUND));
//
//		UserSurvey survey = surveyRepo.findById(userId)
//			.orElse(null);
//
//		UserContextDto userCtx = UserContextDto.builder()
//				.botImage(setting.getBotImage())
//				.botCustom(setting.getBotCustom())
//				.isAlarm(setting.getIsAlarm())
//				.gender(info.getGender())
//				.age(info.getAge())
//				.career(info.getCareer())
//				.mbti(info.getMbti())
//
//				.depression(survey != null ? survey.getDepression() : 0)
//				.anxiety  (survey != null ? survey.getAnxiety()   : 0)
//				.stress   (survey != null ? survey.getStress()    : 0)
//				.suicide  (survey != null && survey.isSuicide())
//				.stressReason(survey != null ? survey.getStressReason() : "")
//				.build();
//
//		return userCtx;
//	}
//
//	/** FastAPI audio: 감정분석만 리턴 */
//	private AudioAiResponse callAudioService(String audioUrl) {
//		return restClient.post()
//				.uri(fastApiAudioUrl + "/analyze")
//				.contentType(MediaType.APPLICATION_JSON)
//				.body(Map.of("audioUrl", audioUrl))
//				.retrieve()
//				.body(AudioAiResponse.class);
//	}

}
