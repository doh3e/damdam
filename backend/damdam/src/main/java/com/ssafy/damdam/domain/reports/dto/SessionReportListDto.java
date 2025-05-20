package com.ssafy.damdam.domain.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionReportListDto {

    private Long sReportId;
    private Long counsId;
    private String sReportTitle;
    private LocalDateTime createdAt;

}
