package com.ssafy.damdam.domain.reports.controller;

import com.ssafy.damdam.domain.reports.dto.PeriodReportListDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportListDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/damdam/reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("")
    public ResponseEntity<List<Object>> getReportList(
            @RequestParam(value = "category") String category,
            @RequestParam(value = "start", required = false) String start,
            @RequestParam(value = "end",   required = false) String end,
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        if ("session".equalsIgnoreCase(category)) {
            List<SessionReportListDto> sReports = reportService.getSReportList(start, end, keyword);
            return ResponseEntity.ok(new ArrayList<>(sReports));
        }
        else if ("period".equalsIgnoreCase(category)) {
            List<PeriodReportListDto> pReports = reportService.getPReportList(start, end, keyword);
            return ResponseEntity.ok(new ArrayList<>(pReports));
        }
        else {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<SessionReportOutputDto> getSessionReport(
            @PathVariable Long reportId
    ) {
        return ResponseEntity.ok(reportService.getSessionReport(reportId));
    }

    @PatchMapping("/reports/{reportId}")
    public ResponseEntity<?> updateSessionReportTitle(
            @PathVariable Long reportId,
            @RequestParam String sReportTitle
    ) {
        reportService.updateSessionReportTitle(reportId, sReportTitle);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/reports/{reportId}")
    public ResponseEntity<?> deleteSessionReport(
            @PathVariable Long reportId
    ) {
        reportService.deleteSessionReport(reportId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports/periodic/{pReportId}")
    public ResponseEntity<PeriodReportOutputDto> getPeriodReport(
            @PathVariable Long pReportId
    ) {
        return ResponseEntity.ok(reportService.getPeriodReport(pReportId));
    }

    @PatchMapping("/reports/periodic/{pReportId}")
    public ResponseEntity<?> updatePeriodReportTitle(
            @PathVariable Long pReportId,
            @RequestParam String pReportTitle
    ) {
        reportService.updatePeriodReportTitle(pReportId, pReportTitle);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/reports/periodic/{pReportId}")
    public ResponseEntity<?> deletePeriodReport(
            @PathVariable Long pReportId
    ) {
        reportService.deletePeriodReport(pReportId);
        return ResponseEntity.noContent().build();
    }

}
