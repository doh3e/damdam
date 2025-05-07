package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.dto.ChatOutputDto;
import com.ssafy.damdam.global.redis.CounselSession;
import com.ssafy.damdam.global.redis.CounselSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {

	private final CounselSessionRepository counselSessionRepository;
	private final SimpMessagingTemplate messagingTemplate;
	private final RedisTemplate<String, Object> redisTemplate;

	/**
	 * 실시간 채팅 테스트용 handleChat 메서드
	 * - 사용자 입력과 임시 AI 응답을 Redis 리스트에 순서대로 저장
	 * - WebSocket 구독자에게 입력과 응답을 즉시 브로드캐스트
	 */
	@Override
	@Transactional
	public void handleChat(Long roomId, Long userId, ChatInputDto input) {
		// Redis 세션 로드 또는 초기화
		CounselSession session = counselSessionRepository.findById(roomId)
				.orElseGet(() -> {
					CounselSession s = new CounselSession();
					s.setCounsId(roomId);
					s.setTokenCount(20);
					return s;
				});

		// 토큰 차감 및 세션 저장
		session.decrementToken();
		counselSessionRepository.save(session);

		// Redis 리스트 키
		String listKey = "counsel:" + roomId + ":messages";

		// 1) 사용자 입력 기록
		redisTemplate.opsForList().rightPush(listKey, input);

		// 2) 테스트용 AI 응답 생성
		ChatOutputDto output = ChatOutputDto.builder()
				.sender("AI")
				.isVoice(false)
				.message("이것은 테스트용 응답입니다. 유저가 보낸 메시지: '" + input.getMessage() + "'")
				.timestamp(LocalDateTime.now().toString())
				.tokenCount(session.getTokenCount())
				.happiness(50)
				.angry(10)
				.disgust(5)
				.fear(5)
				.neutral(30)
				.sadness(0)
				.surprise(0)
				.build();

		// AI 응답 기록
		redisTemplate.opsForList().rightPush(listKey, output);

		// WebSocket 브로드캐스트: 사용자 메시지
		messagingTemplate.convertAndSend(
				"/sub/counsels/" + roomId + "/chat",
				input
		);

		// WebSocket 브로드캐스트: AI 응답
		messagingTemplate.convertAndSend(
				"/sub/counsels/" + roomId + "/chat",
				output
		);

		log.info("[Room {}] Input and Test Output saved to Redis and broadcast", roomId);
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
