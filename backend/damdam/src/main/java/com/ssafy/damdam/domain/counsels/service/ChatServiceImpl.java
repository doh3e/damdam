package com.ssafy.damdam.domain.counsels.service;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.RedisUserChatInput;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.global.redis.CounselSession;
import com.ssafy.damdam.global.redis.CounselSessionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {

	private final CounselSessionRepository counselSessionRepository;
	private final SimpMessagingTemplate messagingTemplate;
	private final RedisTemplate<String, Object> redisTemplate;
	private final ObjectMapper objectMapper;

	@Override
	@Transactional
	public void handleChat(Long roomId, Long userId, ChatInputDto input) {
		String listKey = "counsel:" + roomId + ":messages";

		// 세션 조회 또는 생성
		CounselSession session = counselSessionRepository.findById(roomId)
				.orElseGet(() -> {
					log.info("새로운 상담 세션 생성: roomId={}, userId={}", roomId, userId);
					return counselSessionRepository.save(
							CounselSession.builder()
									.counsId(roomId)
									.userId(userId)
									.tokenCount(20)
									.messageOrder(0)
									.build()
					);
				});

		int tokenBefore = session.getTokenCount();

		// Redis에 저장할 DTO 구성
		RedisUserChatInput redisInput = RedisUserChatInput.builder()
				.sender("USER")
				.isVoice(input.getIsVoice())
				.messageOrder(input.getMessageOrder())
				.message(input.getMessage())
				.timestamp(LocalDateTime.now())
				.build();

		try {
			// 메시지 저장
			redisTemplate.opsForList().rightPush(listKey, redisInput);
			log.info("Redis 저장 완료: roomId={}, messageOrder={}, message={}",
					roomId, input.getMessageOrder(), input.getMessage());

			// 웹소켓으로 전송
			messagingTemplate.convertAndSend("/sub/counsels/" + roomId + "/chat", redisInput);

			// 토큰 차감
			session.decrementToken();
			counselSessionRepository.save(session);
			log.info("토큰 감소: roomId={}, 이전 토큰={}, 현재 토큰={}", roomId, tokenBefore, session.getTokenCount());

		} catch (Exception e) {
			log.error("채팅 처리 중 오류 발생: {}", e.getMessage(), e);
		}
	}


	/**
	 * 상담 종료 시 세션과 대화 이력 삭제
	 */
	@Transactional
	public void endCounsel(Long roomId) {
		// 세션 삭제
		counselSessionRepository.deleteById(roomId);

		// Redis 대화 이력 삭제
		String listKey = "counsel:" + roomId + ":messages";
		redisTemplate.delete(listKey);

		log.info("[Room {}] 상담 종료: Redis 대화 기록 삭제", roomId);
	}

}
