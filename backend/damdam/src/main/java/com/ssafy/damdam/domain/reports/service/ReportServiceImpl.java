package com.ssafy.damdam.domain.reports.service;

import com.ssafy.damdam.domain.reports.repository.PeriodReportRepository;
import com.ssafy.damdam.domain.reports.repository.SessionReportRepository;
import com.ssafy.damdam.global.util.user.UserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final PeriodReportRepository periodReportRepository;
    private final SessionReportRepository sessionReportRepository;
    private final UserUtil userUtil;
}
