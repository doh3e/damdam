package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import org.springframework.web.multipart.MultipartFile;

public interface ChatService {
	void handleChat(Long roomId, Long userId, String nickname ,ChatInputDto input);

	void endCounsel(Long counsId);

	void handleVoiceMessage(Long counsId, Long userId, String nickname, int messageOrder, MultipartFile file);
}
