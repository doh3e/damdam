package com.ssafy.damdam.domain.counsels.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.damdam.domain.counsels.dto.CounsListDto;
import com.ssafy.damdam.domain.counsels.service.CounselService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
//@RequestMapping("/api/v1/damdam/counsels")
public class CounselController {

	private final CounselService counselService;

	@GetMapping("")
	public ResponseEntity<CounsListDto> showCounselList() {
		CounsListDto dto = counselService.getCounselList();
		return ResponseEntity.ok(dto);
	}
}
