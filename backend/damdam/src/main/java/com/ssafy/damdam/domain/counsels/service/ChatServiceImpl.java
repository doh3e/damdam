package com.ssafy.damdam.domain.counsels.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.global.redis.CounselSessionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {

	private final CounselSessionRepository counselSessionRepository;

	@Override
	public void handleChat(Long roomId, ChatInputDto input) {

	}
}
