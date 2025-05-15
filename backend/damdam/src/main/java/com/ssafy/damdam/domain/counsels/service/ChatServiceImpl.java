package com.ssafy.damdam.domain.counsels.service;

import java.time.LocalDateTime;
import java.util.concurrent.ExecutorService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.ChatOutputDto;
import com.ssafy.damdam.domain.counsels.dto.RedisUserChatInput;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.global.redis.CounselSession;
import com.ssafy.damdam.global.redis.CounselSessionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {

	private final CounselSessionRepository counselSessionRepository;
	private final SimpMessagingTemplate messagingTemplate;
	private final RedisTemplate<String, Object> redisTemplate;
	private final AiService aiService;
	private final ExecutorService virtualThreadExecutor;
	private final S3FileUploadService s3FileUploadService;

	@Override
	@Transactional
	public void handleChat(
			Long roomId,
			Long userId,
			String nickname,
			ChatInputDto input
	) {

		if (input.getIsVoice()) {
			return;
		}

		counselSessionRepository.findById(roomId)
				.orElseGet(() -> {
					log.info("[ChatService] 세션 자동 생성 (첫 채팅 유저 정보로): roomId={}, userId={}, nickname={}",
							roomId, userId, nickname);
					return counselSessionRepository.save(
							CounselSession.builder()
									.counsId(roomId)
									.userId(userId)
									.tokenCount(20)
									.sender(nickname)
									.isVoice(input.getIsVoice())
									.message(input.getMessage())
									.timestamp(LocalDateTime.now())
									.build()
					);
				});

		String listKey = "counsel:" + roomId + ":messages";

		// 1) Redis에 USER 텍스트 메시지 저장
		RedisUserChatInput redisInput = RedisUserChatInput.builder()
				.sender("USER")
				.isVoice(false)
				.messageOrder(input.getMessageOrder())
				.message(input.getMessage())
				.timestamp(LocalDateTime.now())
				.build();

		redisTemplate.opsForList().rightPush(listKey, redisInput);

		// 텍스트 대화일 시 바로 LLM 호출
		virtualThreadExecutor.submit(() -> {
			ChatOutputDto botReply = aiService.chatWithLlm(
					roomId,
					userId,
					nickname,
					input
			);

			// Redis에 AI 응답 저장
			redisTemplate.opsForList().rightPush(listKey, botReply);

			// WebSocket 전송
			messagingTemplate.convertAndSend(
					"/sub/counsels/" + roomId + "/chat", botReply);
		});
	}

	@Override
	@Transactional
	public void handleVoiceMessage(
			Long roomId,
			Long userId,
			String nickname,
			int messageOrder,
			MultipartFile file
	) {
		String listKey = "counsel:" + roomId + ":messages";

		// 1) S3 업로드
		String audioUrl = s3FileUploadService.uploadAudio(file, "audio");
		log.info("S3 업로드 완료: roomId={}, messageOrder={}, url={}",
				roomId, messageOrder, audioUrl);

		// 2) Redis에 저장할 DTO 구성
		RedisUserChatInput voiceInput = RedisUserChatInput.builder()
				.sender(nickname)
				.isVoice(true)
				.messageOrder(messageOrder)
				.message(audioUrl)
				.timestamp(LocalDateTime.now())
				.build();

		// 저장 및 브로드캐스트
		redisTemplate.opsForList().rightPush(listKey, voiceInput);
		messagingTemplate.convertAndSend(
				"/sub/counsels/" + roomId + "/chat", voiceInput
		);

		// 3) 감정 분석 스케줄링
		aiService.analyzeAndSave(
				roomId,
				userId,
				nickname,
				messageOrder,
				audioUrl
		);
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
