package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.dto.ChatOutputDto;
import com.ssafy.damdam.domain.users.entity.UserInfo;
import com.ssafy.damdam.domain.users.entity.UserSetting;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiServiceImpl implements AiService {

	private final RestClient restClient;

	@Value("${fastapi.llm.base-url}")
	private String fastApiLLMUrl;

	@Override
	public ChatOutputDto analyzeAndRespond(Long roomId, Long userId, ChatInputDto input, int remainingTokens, UserInfo userInfo, UserSetting userSetting) {
		return null;
	}
}
