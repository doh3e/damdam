package com.ssafy.damdam.domain.counsels.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// llm → 백엔드 채팅으로 받을 정보들
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class LlmAiChatResponse {
    @JsonProperty("ai_response")
    private String aiResponse;
}
