package com.ssafy.damdam.domain.counsels.controller;

import java.security.Principal;
import java.util.concurrent.ExecutionException;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class CounselChatController {

	private final ChatService chatService;

	@MessageMapping("/counsels/{roomId}/chat")
	public void handleChat(
		@DestinationVariable Long roomId,
		Principal principal,
		@Payload ChatInputDto input
	) throws ExecutionException, InterruptedException {

		Long userId = Long.valueOf(principal.getName());
		chatService.handleChat(roomId, userId, input);
	}
}
