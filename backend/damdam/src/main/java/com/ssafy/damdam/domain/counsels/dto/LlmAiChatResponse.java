package com.ssafy.damdam.domain.counsels.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class LlmAiChatResponse {
    @JsonProperty("ai_response")
    private String aiResponse;
}
