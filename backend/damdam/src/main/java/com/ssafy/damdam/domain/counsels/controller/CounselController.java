package com.ssafy.damdam.domain.counsels.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.damdam.domain.counsels.dto.CounsListDto;
import com.ssafy.damdam.domain.counsels.dto.CounsOutputDto;
import com.ssafy.damdam.domain.counsels.dto.CreateCounselResponse;
import com.ssafy.damdam.domain.counsels.service.CounselService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/damdam/counsels")
public class CounselController {

	private final CounselService counselService;

	@GetMapping("")
	public ResponseEntity<List<CounsListDto>> showCounselList() {
		List<CounsListDto> list = counselService.getCounselList();
		return ResponseEntity.ok(list);
	}

	@PostMapping("")
	public ResponseEntity<CreateCounselResponse> createCounsel() {
		Long id = counselService.createCounsel();
		return ResponseEntity
			.created(URI.create(String.valueOf(id)))
			.body(new CreateCounselResponse(id));
	}

	// 상담 방 내역 조회 + 이전 상담 내역 S3에서 뽑아오기 (추후 개발)
	@GetMapping("/{counsId}")
	public ResponseEntity<CounsOutputDto> getCounsel(@PathVariable Long counsId) {
		return ResponseEntity.ok(counselService.getCounsel(counsId));
	}

	@DeleteMapping("/{counsId}")
	public ResponseEntity<String> deleteCounsel(@PathVariable Long counsId) {
		counselService.deleteCounsel(counsId);
		return ResponseEntity.ok("상담이 삭제되었습니다.");
	}
}
