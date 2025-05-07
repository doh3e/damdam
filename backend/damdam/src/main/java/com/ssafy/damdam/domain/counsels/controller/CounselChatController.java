package com.ssafy.damdam.domain.counsels.controller;

import com.ssafy.damdam.domain.users.dto.auth.CustomOAuth2User;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.service.ChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class CounselChatController {

	private final ChatService chatService;

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
