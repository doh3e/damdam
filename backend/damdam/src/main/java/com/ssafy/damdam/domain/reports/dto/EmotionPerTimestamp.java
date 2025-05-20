package com.ssafy.damdam.domain.reports.dto;

import com.ssafy.damdam.domain.counsels.dto.EmotionDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class EmotionPerTimestamp {
    private LocalDateTime timestamp;
    private int messageOrder;
    private EmotionDto emotion;
}
