package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmotionAnalysisDto {
    private int happiness;
    private int sadness;
    private int angry;
    private int neutral;
    private int other;
}
