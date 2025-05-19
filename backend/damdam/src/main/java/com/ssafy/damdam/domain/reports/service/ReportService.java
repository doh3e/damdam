package com.ssafy.damdam.domain.reports.service;

import com.ssafy.damdam.domain.reports.dto.PeriodReportListDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportListDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    List<SessionReportListDto> getSReportList(String startDate, String endDate, String keyword);

    List<PeriodReportListDto> getPReportList(String startDate, String endDate, String keyword);

    SessionReportOutputDto getSessionReport(Long reportId);

    void updateSessionReportTitle(Long reportId, String sessionReportTitle);

    void deleteSessionReport(Long reportId);

    PeriodReportOutputDto getPeriodReport(Long pReportId);

    void updatePeriodReportTitle(Long pReportId, String pReportTitle);

    void deletePeriodReport(Long pReportId);
}
