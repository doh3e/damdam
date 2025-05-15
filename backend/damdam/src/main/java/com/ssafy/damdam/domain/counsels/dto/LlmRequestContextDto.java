// ChatRequestDto.java
package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LlmRequestContextDto {
    private String nickname;
    private String message;
    private boolean isVoice;
    private UserContextDto userContext;
    private EmotionAnalysisDto emotion;
}
