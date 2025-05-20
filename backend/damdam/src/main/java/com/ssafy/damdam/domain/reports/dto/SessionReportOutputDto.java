package com.ssafy.damdam.domain.reports.dto;


import com.ssafy.damdam.domain.counsels.dto.EmotionDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionReportOutputDto {
    private Long sReportId;
    private String sReportTitle;

    private Long userId;
    private String nickname;

    private Long counsId;
    private String counsTitle;

    private String summary;
    private String analyze;

    private String valence;
    private String arousal;

    private List<EmotionPerTimestamp> emotionList;

    private LocalDateTime createdAt;
}
