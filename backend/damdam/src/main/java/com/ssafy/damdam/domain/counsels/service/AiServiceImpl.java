package com.ssafy.damdam.domain.counsels.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.AudioAiResponse;
import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.dto.ChatOutputDto;
import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import com.ssafy.damdam.domain.users.repository.UserSurveyRepository;
import com.ssafy.damdam.global.redis.CounselSession;
import com.ssafy.damdam.global.redis.CounselSessionRepository;
import com.ssafy.damdam.global.webclient.client.AudioClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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
	private final AudioClient audioClient;
	private final RedisTemplate<String, Object> redisTemplate;
	private final CounselSessionRepository sessionRepository;
	private final ObjectMapper objectMapper;
	private final SimpMessagingTemplate messagingTemplate;

	@Override
	@Transactional
	public void analyzeAndSave(Long roomId, Long userId, int messageOrder, String audioUrl) {
		virtualThreadExecutor.submit(() -> {
			try {
				AudioAiResponse analysis = audioClient.analyzeAudio(audioUrl);
				String listKey = "counsel:" + roomId + ":messages";
				log.info("AI로 받아온 roomId: {}, userId: {}, messageOrder: {}, audioUrl: {}",
						roomId, userId, messageOrder, audioUrl);

				// 전체 리스트 조회
				List<Object> allMessages =
						redisTemplate.opsForList().range(listKey, 0, -1);

				// messageOrder가 일치하는 항목 찾기
				Object raw = null;
				for (Object item : allMessages) {
					ChatInputDto dto = objectMapper.convertValue(item, ChatInputDto.class);
					if (dto.getMessageOrder() == messageOrder) {
						raw = item;
						break;
					}
				}
				if (raw == null) {
					log.warn("[AiService] messageOrder {}에 해당하는 Redis 항목이 존재하지 않습니다.", messageOrder);
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

}
