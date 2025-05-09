package com.ssafy.damdam.domain.counsels.controller;

import java.security.Principal;

import com.ssafy.damdam.domain.counsels.service.AiService;
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
	private final AiService aiService;

	@MessageMapping("/counsels/{roomId}/chat")
	public void handleChat(
		@DestinationVariable Long roomId,
		Principal principal,
		ChatInputDto input
	) {
		Long userId = Long.valueOf(principal.getName());
		chatService.handleChat(roomId, userId, input);
	}
}
