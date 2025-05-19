package com.ssafy.damdam.domain.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodReportListDto {
    private Long pReportId;
    private String pReportTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
}
