package com.ssafy.damdam.domain.reports.controller;

import com.ssafy.damdam.domain.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/damdam/reports")
public class ReportController {

    private final ReportService reportService;

}
