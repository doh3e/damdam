package com.ssafy.damdam.domain.counsels.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.dto.EmotionDto;
import com.ssafy.damdam.domain.counsels.dto.LlmAiChatResponse;
import com.ssafy.damdam.domain.counsels.dto.LlmSummaryResponse;

public interface AiService {
	EmotionDto analyzeAudio(Long roomId, Long userId, int messageOrder, String audioUrl);

	EmotionDto analyzingText(String message);

	LlmAiChatResponse chatWithLlm(Long roomId, Long userId, String nickname, ChatInputDto input);

	LlmSummaryResponse getSessionReport(Long counsId) throws JsonProcessingException;
}
