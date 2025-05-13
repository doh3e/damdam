package com.ssafy.damdam.domain.helps.controller;

import com.ssafy.damdam.domain.helps.dto.NoticeOutputDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.damdam.domain.helps.service.HelpService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/damdam/helps")
public class HelpController {

	private final HelpService helpService;

	@GetMapping("/notice")
	public ResponseEntity<List<NoticeOutputDto>> getNoticeList() {
		List<NoticeOutputDto> list = helpService.getNoticeList();
		return ResponseEntity.ok(list);
	}
}
