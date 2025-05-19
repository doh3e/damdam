package com.ssafy.damdam.domain.reports.controller;

import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "start", required = false) String start,
            @RequestParam(value = "end",   required = false) String end,
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        if ("session".equals(category)) {
            List<SessionReportOutputDto> sReports = reportService.getSReportList(start, end, keyword);
            return ResponseEntity.ok(new ArrayList<>(sReports));
        }
        if ("period".equals(category)) {
            List<PeriodReportOutputDto> pReports = reportService.getPReportList(start, end, keyword);
            return ResponseEntity.ok(new ArrayList<>(pReports));
        }

        // all
        List<Object> combined = new ArrayList<>();
        combined.addAll(reportService.getSReportList(start, end, keyword));
        combined.addAll(reportService.getPReportList(start, end, keyword));
        return ResponseEntity.ok(combined);
    }

}
