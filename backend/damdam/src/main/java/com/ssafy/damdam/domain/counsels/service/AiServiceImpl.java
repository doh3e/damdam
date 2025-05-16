package com.ssafy.damdam.domain.counsels.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.*;
import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import com.ssafy.damdam.domain.users.repository.UserSurveyRepository;
import com.ssafy.damdam.global.redis.CounselSession;
import com.ssafy.damdam.global.redis.CounselSessionRepository;
import com.ssafy.damdam.global.webclient.client.AnalyzeAudioClient;

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
	private final LlmChatClient llmChatClient;
	private final LlmSummaryClient llmSummaryClient;
	private final RedisTemplate<String, Object> redisTemplate;
	private final CounselSessionRepository sessionRepository;
	private final ObjectMapper objectMapper;
	private final SimpMessagingTemplate messagingTemplate;

    @Override
	@Transactional
	public void analyzeAndSave(Long roomId, Long userId, String nickname, int messageOrder, String audioUrl) {
		virtualThreadExecutor.submit(() -> {
			try {
				AudioAiResponse analysis = analyzeAudioClient.analyzeAudio(audioUrl);
				String listKey = "counsel:" + roomId + ":messages";
				log.info("AI로 받아온 roomId: {}, userId: {}, messageOrder: {}, audioUrl: {}",
						roomId, userId, messageOrder, audioUrl);

				// 전체 리스트 조회
				List<Object> allMessages = redisTemplate.opsForList().range(listKey, 0, -1);
				Object raw = null;

				for (Object item : allMessages) {
					@SuppressWarnings("unchecked")
					Map<String,Object> map = (Map<String,Object>) item;
					String sender = (String) map.get("sender");
					if ("AI".equals(sender)) continue;
					Integer order = (Integer) map.get("messageOrder");
					if (order != null && order == messageOrder) {
						raw = item;
						break;
					}
				}

				if (raw == null) {
					log.warn("[AiService] messageOrder {}에 해당하는 Redis 항목이 없습니다.", messageOrder);
					return;
				}

				ChatInputDto input = objectMapper.convertValue(raw, ChatInputDto.class);


				// 이하 기존 로직 유지...
				CounselSession session = sessionRepository.findById(roomId)
						.orElseGet(() -> {
							CounselSession newSession = CounselSession.builder()
									.counsId(roomId)
									.userId(userId)
									.tokenCount(20)
									.sender("USER")
									.isVoice(input.getIsVoice())
									.message(input.getMessage())
									.timestamp(LocalDateTime.now())
									.build();
							log.info("[AiService] 새로운 세션 생성: roomId={}, tokenCount=20", roomId);
							return newSession;
						});

				session.setAngry(analysis.getAngry());
				session.setHappiness(analysis.getHappiness());
				session.setNeutral(analysis.getNeutral());
				session.setSadness(analysis.getSadness());
				session.setOther(analysis.getOther());
				session.decrementToken();
				sessionRepository.save(session);

				ChatOutputDto response = ChatOutputDto.builder()
						.sender("AI")
						.message("현재 감정 상태는 '" + analysis.getEmotion() + "'입니다.")
						.timestamp(LocalDateTime.now())
						.tokenCount(session.getTokenCount())
						.happiness(analysis.getHappiness())
						.angry(analysis.getAngry())
						.neutral(analysis.getNeutral())
						.sadness(analysis.getSadness())
						.other(analysis.getOther())
						.messageOrder(messageOrder)
						.build();

				redisTemplate.opsForList().rightPush(listKey, response);
				messagingTemplate.convertAndSend("/sub/counsels/" + roomId + "/chat", response);
				log.info("[AiService] 감정 분석 및 AI 응답 전송 완료 - messageOrder: {}", messageOrder);

			} catch (Exception e) {
				log.error("[AiService] 감정 분석 중 예외 발생", e);
			}
		});
	}

	@Override
	public ChatOutputDto chatWithLlm(
			Long roomId,
			Long userId,
			String nickname,
			ChatInputDto input
	) {

		log.info("chatwithllm service 진입 완료");

		CounselSession session = sessionRepository.findById(roomId)
				.orElseThrow(() -> new IllegalStateException("세션이 없습니다: " + roomId));

		LlmAiChatRequest request = LlmAiChatRequest.builder()
				.nickname(nickname)
				.message(input.getMessage())
				.build();

		log.info("chatwithllm service request: {}", request);

		LlmAiChatResponse response = llmChatClient.requestChatResponse(request);

		String aiText = response != null
				? response.getAiResponse()
				: "죄송합니다, LLM 응답을 받아오는데 실패했습니다.";

		session.decrementToken();
		sessionRepository.save(session);

		// 4) ChatOutputDto 에 담아서 리턴
		return ChatOutputDto.builder()
				.sender("AI")
				.message(aiText)
				.timestamp(LocalDateTime.now())
				.messageOrder(input.getMessageOrder())
				.tokenCount(session.getTokenCount())
				.build();
	}


}
