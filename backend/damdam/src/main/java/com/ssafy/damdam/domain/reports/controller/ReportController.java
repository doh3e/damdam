package com.ssafy.damdam.domain.reports.controller;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.damdam.domain.reports.dto.CreatePeriodReportResponse;
import com.ssafy.damdam.domain.reports.dto.PeriodReportInputDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportListDto;
import com.ssafy.damdam.domain.reports.dto.PeriodReportOutputDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportListDto;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.reports.service.ReportService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
		@RequestParam(value = "end", required = false) String end,
		@RequestParam(value = "keyword", required = false) String keyword
	) {
		if ("session".equalsIgnoreCase(category)) {
			List<SessionReportListDto> sReports = reportService.getSReportList(start, end, keyword);
			return ResponseEntity.ok(new ArrayList<>(sReports));
		} else if ("period".equalsIgnoreCase(category)) {
			List<PeriodReportListDto> pReports = reportService.getPReportList(start, end, keyword);
			return ResponseEntity.ok(new ArrayList<>(pReports));
		} else {
			return ResponseEntity.badRequest().body(new ArrayList<>());
		}
	}

	@GetMapping("/{reportId}")
	public ResponseEntity<SessionReportOutputDto> getSessionReport(
		@PathVariable Long reportId
	) {
		return ResponseEntity.ok(reportService.getSessionReport(reportId));
	}

	@PatchMapping("/{reportId}")
	public ResponseEntity<Void> updateSessionReportTitle(
		@PathVariable Long reportId,
		@RequestParam String sReportTitle
	) {
		reportService.updateSessionReportTitle(reportId, sReportTitle);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{reportId}")
	public ResponseEntity<Void> deleteSessionReport(
		@PathVariable Long reportId
	) {
		reportService.deleteSessionReport(reportId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/periodic/{pReportId}")
	public ResponseEntity<PeriodReportOutputDto> getPeriodReport(
		@PathVariable Long pReportId
	) {
		return ResponseEntity.ok(reportService.getPeriodReport(pReportId));
	}

	@PatchMapping("/periodic/{pReportId}")
	public ResponseEntity<Void> updatePeriodReportTitle(
		@PathVariable Long pReportId,
		@RequestParam String pReportTitle
	) {
		reportService.updatePeriodReportTitle(pReportId, pReportTitle);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/periodic/{pReportId}")
	public ResponseEntity<Void> deletePeriodReport(
		@PathVariable Long pReportId
	) {
		reportService.deletePeriodReport(pReportId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/periodic")
	public ResponseEntity<CreatePeriodReportResponse> createPeriodReport(
		@RequestBody PeriodReportInputDto periodReportInputDto
	) {
		Long pReportId = reportService.createPeriodReport(periodReportInputDto);
		return ResponseEntity
			.created(URI.create(String.valueOf(pReportId)))
			.body(new CreatePeriodReportResponse(pReportId));
	}

}
