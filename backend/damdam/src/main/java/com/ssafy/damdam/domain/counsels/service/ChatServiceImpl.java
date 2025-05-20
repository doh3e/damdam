package com.ssafy.damdam.domain.counsels.service;

import static com.ssafy.damdam.global.redis.exception.RedisExceptionCode.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.dto.ChatMessageDto;
import com.ssafy.damdam.domain.counsels.dto.ChatOutputDto;
import com.ssafy.damdam.domain.counsels.dto.EmotionDto;
import com.ssafy.damdam.domain.counsels.dto.LlmAiChatResponse;
import com.ssafy.damdam.domain.users.repository.UsersRepository;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;
import com.ssafy.damdam.global.redis.CounselSession;
import com.ssafy.damdam.global.redis.CounselSessionRepository;
import com.ssafy.damdam.global.redis.exception.RedisException;

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
	private final AiService aiService;
	private final ExecutorService virtualThreadExecutor;
	private final S3FileUploadService s3FileUploadService;
	private final UsersRepository usersRepository;
	private final ObjectMapper objectMapper;

	// 레디스 세션을 업데이트 하는 공통 메서드
	private void updateSession(CounselSession session, EmotionDto emotion, LlmAiChatResponse botReply) {
		session.decrementToken();
		session.setHappiness(emotion.getHappiness());
		session.setAngry(emotion.getAngry());
		session.setNeutral(emotion.getNeutral());
		session.setSadness(emotion.getSadness());
		session.setOther(emotion.getOther());
		session.setSender("AI");
		session.setMessage(botReply.getAiResponse());
		session.setTimestamp(LocalDateTime.now());
	}

	@Override
	@Transactional
	public void handleChat(
		Long roomId,
		Long userId,
		ChatInputDto input
	) throws ExecutionException, InterruptedException {

		ZoneId seoul = ZoneId.of("Asia/Seoul");

		counselSessionRepository.findById(roomId)
			.orElseGet(() -> {
				log.info("[ChatService] 첫 세션 자동 생성:  roomId={}, userId={}",
					roomId, userId);
				return counselSessionRepository.save(
					CounselSession.builder()
						.counsId(roomId)
						.userId(userId)
						.tokenCount(20)
						.build()
				);
			});

		String listKey = "counsel:" + roomId + ":messages";

		ChatMessageDto userMsg = ChatMessageDto.builder()
			.sender("USER")
			.isVoice(input.getIsVoice())
			.messageOrder(input.getMessageOrder())
			.message(input.getMessage())
			.timestamp(LocalDateTime.now(seoul))
			.emotion(null)   // 아직 분석 전이므로 null
			.build();

		redisTemplate.opsForList().rightPush(listKey, userMsg);

		if (input.getIsVoice()) {
			return;
		}

		// 텍스트 대화일 시 텍스트 감정 분석 호출
		Future<EmotionDto> future = virtualThreadExecutor.submit(() ->
			aiService.analyzingText(input.getMessage())
		);

		EmotionDto emotion = future.get();

		log.info("텍스트 감정 분석 완료: roomId={}, messageOrder={}, message={}," +
				" happy={} angry={} neutral={} sadness={} other={}",
			roomId, input.getMessageOrder(), input.getMessage(), emotion.getHappiness(),
			emotion.getAngry(), emotion.getNeutral(),
			emotion.getSadness(), emotion.getOther());

		// 유저 닉네임 호출
		String nickname = usersRepository.findById(userId).get().getNickname();

		// llm 로직 호출
		LlmAiChatResponse botReply = aiService.chatWithLlm(
			roomId, userId, nickname, input, emotion
		);

		// 세션 업데이트 (토큰 차감 + 마지막 감정 저장)
		CounselSession session = counselSessionRepository.findById(roomId)
			.orElseThrow(() -> new RedisException(REDIS_SESSION_NOT_FOUND));
		updateSession(session, emotion, botReply);
		session.setMessageOrder(input.getMessageOrder());
		counselSessionRepository.save(session);

		// 해당하는 레디스 방에 AI 응답 생성 (여기에는 LLM의 대답 + 감정 분석 결과 함께)
		ChatMessageDto aiMsg = ChatMessageDto.builder()
			.sender("AI")
			.isVoice(false)
			.messageOrder(input.getMessageOrder())
			.message(botReply.getAiResponse())
			.timestamp(LocalDateTime.now(seoul))
			.emotion(emotion)
			.build();

		redisTemplate.opsForList().rightPush(listKey, aiMsg);

		// WebSocket 전송 응답 생성 (여기에는 분석 결과 제외)
		ChatOutputDto chatOutputDto = ChatOutputDto.builder()
			.sender("AI")
			.message(botReply.getAiResponse())
			.timestamp(LocalDateTime.now(seoul))
			.tokenCount(session.getTokenCount())
			.messageOrder(input.getMessageOrder())
			.build();

		messagingTemplate.convertAndSend(
			"/sub/counsels/" + roomId + "/chat", chatOutputDto);
	}

	@Override
	@Transactional
	public void handleVoiceMessage(
		Long roomId,
		Long userId,
		int messageOrder,
		MultipartFile file
	) throws ExecutionException, InterruptedException {

		ZoneId seoul = ZoneId.of("Asia/Seoul");

		String audioUrl = s3FileUploadService.uploadAudio(file, "audio");
		log.info("S3 업로드 완료: roomId={}, messageOrder={}, url={}",
			roomId, messageOrder, audioUrl);

		// 받아온 file과 웹소켓 메세지(redis에 저장된)가 같은 대화를 매치시킴
		// 같은 룸의 대화 전체를 탐색해서 같은 messageOrder를 가진 대화를 session으로 갖는다.
		CounselSession session = counselSessionRepository.findById(roomId)
			.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상담방입니다: " + roomId));

		String listKey = "counsel:" + roomId + ":messages";
		List<Object> rawList = redisTemplate.opsForList().range(listKey, 0, -1);
		ChatMessageDto userMsg = rawList.stream()
			.map(item -> objectMapper.convertValue(item, ChatMessageDto.class))
			.filter(dto -> dto.getMessageOrder() == messageOrder && "USER".equals(dto.getSender()))
			.findFirst()
			.orElseThrow(() -> new IllegalStateException("해당 순서의 사용자 메시지가 없습니다: " + messageOrder));

		// 존재한다면 음성 대화의 감정 추출
		Future<EmotionDto> future = virtualThreadExecutor.submit(() ->
			aiService.analyzeAudio(roomId, userId, messageOrder, audioUrl)
		);

		EmotionDto emotion = future.get();

		log.info("음성 감정 분석 완료: roomId={}, messageOrder={}, emotion={}",
			roomId, messageOrder, emotion);

		// 유저 닉네임 호출
		String nickname = usersRepository.findById(userId).get().getNickname();

		// llm 호출을 위한 정제
		ChatInputDto input = ChatInputDto.builder()
			.isVoice(true)
			.messageOrder(messageOrder)
			.message(userMsg.getMessage())
			.build();

		// llm 로직 호출
		LlmAiChatResponse botReply = aiService.chatWithLlm(
			roomId, userId, nickname, input, emotion
		);

		// 세션 업데이트
		updateSession(session, emotion, botReply);
		session.setMessageOrder(messageOrder);
		counselSessionRepository.save(session);

		// 레디스에 AI 응답 및 감정분석 결과 추가
		ChatMessageDto aiMsg = ChatMessageDto.builder()
			.sender("AI")
			.isVoice(true)
			.messageOrder(messageOrder)
			.message(botReply.getAiResponse())
			.timestamp(LocalDateTime.now(seoul))
			.emotion(emotion)
			.build();

		redisTemplate.opsForList().rightPush(listKey, aiMsg);

		// 웹소켓에 챗봇 응답 전달
		ChatOutputDto chatOutputDto = ChatOutputDto.builder()
			.sender("AI")
			.message(botReply.getAiResponse())
			.timestamp(LocalDateTime.now(seoul))
			.tokenCount(session.getTokenCount())
			.messageOrder(messageOrder)
			.build();

		messagingTemplate.convertAndSend(
			"/sub/counsels/" + roomId + "/chat", chatOutputDto);

	}

	@Transactional
	public void deleteRedisChatting(Long roomId) {
		// 세션 삭제
		counselSessionRepository.deleteById(roomId);

		// Redis 대화 이력 삭제
		String listKey = "counsel:" + roomId + ":messages";
		redisTemplate.delete(listKey);

		log.info("[Room {}] 상담 종료: Redis 대화 기록 삭제", roomId);
	}

}
