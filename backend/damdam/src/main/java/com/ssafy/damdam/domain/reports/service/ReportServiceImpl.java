package com.ssafy.damdam.domain.reports.service;

import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.reports.dto.PeriodReportInputDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportListDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportListDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.reports.entity.SessionReport;
import com.ssafy.damdam.domain.reports.repository.PeriodReportRepository;
import com.ssafy.damdam.domain.reports.repository.SessionReportRepository;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.global.util.user.UserUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

	private final PeriodReportRepository periodReportRepository;
	private final SessionReportRepository sessionReportRepository;
	private final UserUtil userUtil;

	// 유저 검증 메서드
	private Users validateUser() {
		Users user = userUtil.getUser();
		if (user == null) {
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		return user;
	}

	private boolean isBlank(String s) {
		return s == null || s.isBlank();
	}

	private LocalDate parseDate(String raw) {
		if (isBlank(raw))
			return null;
		return LocalDate.parse(raw, DateTimeFormatter.ofPattern("yyyyMMdd"));
	}

	@Override
	public List<SessionReportListDto> getSReportList(
		String startDate, String endDate, String keyword) {
		Users user = validateUser();

		LocalDate start = parseDate(startDate);
		LocalDate end = parseDate(endDate);

		List<SessionReport> reports = sessionReportRepository
			.findByFilter(user, start, end, keyword);

		return reports.stream()
			.map(r -> {
				var counseling = r.getCounseling();
				return SessionReportListDto.builder()
					.sReportId(r.getSReportId())
					.sReportTitle(r.getSReportTitle())
					.counsId(counseling.getCounsId())
					.createdAt(r.getCreatedAt())
					.build();
			})
			.collect(Collectors.toList());
	}

	@Override
	public List<PeriodReportListDto> getPReportList(
		String startDate, String endDate, String keyword) {
		Users user = validateUser();

		LocalDate start = parseDate(startDate);
		LocalDate end = parseDate(endDate);

		return periodReportRepository.findByFilter(user, start, end, keyword)
			.stream()
			.map(p -> PeriodReportListDto.builder()
				.pReportId(p.getPReportId())
				.pReportTitle(p.getPReportTitle())
				.startDate(p.getStartDate())
				.endDate(p.getEndDate())
				.createdAt(p.getCreatedAt())
				.build()
			)
			.collect(Collectors.toList());
	}

	@Override
	public SessionReportOutputDto getSessionReport(Long reportId) {
		return null;
	}

	@Override
	@Transactional
	public void updateSessionReportTitle(Long reportId, String sessionReportTitle) {

	}

	@Override
	@Transactional
	public void deleteSessionReport(Long reportId) {

	}

	@Override
	public PeriodReportOutputDto getPeriodReport(Long pReportId) {
		return null;
	}

	@Override
	@Transactional
	public void updatePeriodReportTitle(Long pReportId, String pReportTitle) {

	}

	@Override
	@Transactional
	public void deletePeriodReport(Long pReportId) {

	}

	@Override
	@Transactional
	public Long createPeriodReport(PeriodReportInputDto periodReportInputDto) {
		return 0L;
	}
}
