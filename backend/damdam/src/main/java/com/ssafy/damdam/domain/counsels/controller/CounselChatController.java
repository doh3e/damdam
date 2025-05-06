package com.ssafy.damdam.domain.counsels.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.service.ChatService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class CounselChatController {

	private final ChatService chatService;

	@MessageMapping("/counsels/{roomId}/chat")
	public void handleChat(
		@DestinationVariable Long roomId,
		ChatInputDto input
	) {
		chatService.handleChat(roomId, input);
	}

}
