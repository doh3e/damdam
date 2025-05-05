package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;

public interface ChatService {
	void handleChat(Long roomId, ChatInputDto input);
}
