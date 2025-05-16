package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.ExecutionException;

public interface ChatService {
	void handleChat(Long roomId, Long userId, ChatInputDto input) throws ExecutionException, InterruptedException;

	void endCounsel(Long counsId);

	void handleVoiceMessage(Long counsId, Long userId, int messageOrder, MultipartFile file) throws ExecutionException, InterruptedException;
}
