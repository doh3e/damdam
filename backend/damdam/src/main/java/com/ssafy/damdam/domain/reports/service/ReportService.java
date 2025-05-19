package com.ssafy.damdam.domain.reports.service;

import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    List<SessionReportOutputDto> getSReportList(String startDate, String endDate, String keyword);

    List<PeriodReportOutputDto> getPReportList(String startDate, String endDate, String keyword);
}
