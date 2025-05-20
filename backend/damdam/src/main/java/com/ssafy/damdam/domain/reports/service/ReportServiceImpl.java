package com.ssafy.damdam.domain.reports.service;

import static com.ssafy.damdam.domain.reports.exception.ReportExceptionCode.NOT_YOUR_REPORT;
import static com.ssafy.damdam.domain.reports.exception.ReportExceptionCode.REPORT_NOT_FOUND;
import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.ssafy.damdam.domain.counsels.dto.CounselingDto;
import com.ssafy.damdam.domain.counsels.entity.Counseling;
import com.ssafy.damdam.domain.counsels.repository.CounselingRepository;
import com.ssafy.damdam.domain.reports.entity.PeriodReport;
import com.ssafy.damdam.domain.reports.exception.ReportException;
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
	private final CounselingRepository counselingRepository;
	private final UserUtil userUtil;

	// 유저 검증 메서드
	private Users validateUser() {
		Users user = userUtil.getUser();
		if (user == null) {
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		return user;
	}

	// 세션별 레포트 존재 여부 및 권한 검증 메서드
	private SessionReport validateSessionReport(Long reportId) {
		SessionReport report = sessionReportRepository.findById(reportId)
			.orElseThrow(() -> new ReportException(REPORT_NOT_FOUND));

		if (!report.getCounseling().getUsers().getUserId().equals(userUtil.getUser().getUserId())) {
			throw new ReportException(NOT_YOUR_REPORT);
		}
		return report;
	}

	// 기간별 레포트 존재 여부 및 권한 검증 메서드
	private PeriodReport validatePeriodReport(Long reportId) {
		PeriodReport report = periodReportRepository.findById(reportId)
			.orElseThrow(() -> new ReportException(REPORT_NOT_FOUND));

		if (!report.getUsers().getUserId().equals(userUtil.getUser().getUserId())) {
			throw new ReportException(NOT_YOUR_REPORT);
		}
		return report;
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
		Users user = validateUser();

		SessionReport report = validateSessionReport(reportId);

		return SessionReportOutputDto.builder()
			.sReportId(report.getSReportId())
			.sReportTitle(report.getSReportTitle())
			.userId(report.getCounseling().getUsers().getUserId())
			.nickname(report.getCounseling().getUsers().getNickname())
			.counsId(report.getCounseling().getCounsId())
			.counsTitle(report.getCounseling().getCounsTitle())
			.summary(report.getSummary())
			.analyze(report.getAnalyze())
			.valence(report.getValence())
			.arousal(report.getArousal())
			.createdAt(report.getCreatedAt())
			.build();
	}

	@Override
	@Transactional
	public void updateSessionReportTitle(Long reportId, String sessionReportTitle) {
		Users user = validateUser();

		SessionReport report = validateSessionReport(reportId);

		report.updateSReport(sessionReportTitle);
	}

	@Override
	@Transactional
	public void deleteSessionReport(Long reportId) {
		Users user = validateUser();

		SessionReport report = validateSessionReport(reportId);

		sessionReportRepository.delete(report);
	}

	@Override
	public PeriodReportOutputDto getPeriodReport(Long pReportId) {
		Users user = validateUser();

		PeriodReport report = validatePeriodReport(pReportId);

		// 리스트를 통한 상담 목록 만들기
		List<Long> counselIds = report.getCounselList();  // [1,2,3] 같은 형태
		List<CounselingDto> counselingDtoList;

		if (counselIds.isEmpty()) {
			counselingDtoList = List.of();
		} else {
			// 4. 한 번의 쿼리로 모든 Counseling 엔티티 조회
			List<Counseling> counselings = counselingRepository.findAllById(counselIds);

			// 5. ID → 엔티티 맵핑 (순서 보장용)
			Map<Long, Counseling> map = counselings.stream()
					.collect(Collectors.toMap(Counseling::getCounsId, Function.identity()));

			// 6. 원본 순서대로 DTO 변환
			counselingDtoList = counselIds.stream()
					.map(map::get)
					.filter(Objects::nonNull)
					.map(CounselingDto::fromEntity)
					.toList();
		}

		return PeriodReportOutputDto.builder()
			.pReportId(report.getPReportId())
			.pReportTitle(report.getPReportTitle())
			.startDate(report.getStartDate())
			.endDate(report.getEndDate())
			.counselings(counselingDtoList)
			.advice(report.getAdvice())
			.compliment(report.getCompliment())
			.summary(report.getSummary())
			.worry(report.getWorry())
			.counselTime(report.getCounselTime())
			.createdAt(report.getCreatedAt())
			.build();
	}

	@Override
	@Transactional
	public void updatePeriodReportTitle(Long pReportId, String pReportTitle) {
		Users user = validateUser();

		PeriodReport report = validatePeriodReport(pReportId);


	}

	@Override
	@Transactional
	public void deletePeriodReport(Long pReportId) {
		Users user = validateUser();

		PeriodReport report = validatePeriodReport(pReportId);

	}

	@Override
	@Transactional
	public Long createPeriodReport(PeriodReportInputDto periodReportInputDto) {
		Users user = validateUser();

		return 0L;
	}
}
