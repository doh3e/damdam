package com.ssafy.damdam.domain.counsels.service;

import java.util.concurrent.ExecutionException;

import org.springframework.web.multipart.MultipartFile;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;

public interface ChatService {
	void handleChat(Long roomId, Long userId, ChatInputDto input) throws ExecutionException, InterruptedException;

	void deleteRedisChatting(Long counsId);

	void handleVoiceMessage(Long counsId, Long userId, int messageOrder, MultipartFile file) throws
		ExecutionException,
		InterruptedException;
}
