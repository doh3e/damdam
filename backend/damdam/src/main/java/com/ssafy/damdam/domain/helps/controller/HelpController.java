package com.ssafy.damdam.domain.helps.controller;

import com.ssafy.damdam.domain.helps.dto.NoticeInputDto;
import com.ssafy.damdam.domain.helps.dto.NoticeOutputDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

	@PostMapping("/notice")
	public ResponseEntity<Void> createNotice(
			@RequestBody NoticeInputDto noticeInputDto
	) {
		helpService.createNotice(noticeInputDto);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/notice/{noticeId}")
	public ResponseEntity<NoticeOutputDto> getNotice(
			@PathVariable Long noticeId
	) {
		NoticeOutputDto notice = helpService.getNotice(noticeId);
		return ResponseEntity.ok(notice);
	}

	@PatchMapping("/notice/{noticeId}")
	public ResponseEntity<Void> updateNotice(
			@PathVariable Long noticeId,
			@RequestBody NoticeInputDto noticeInputDto
	) {
		helpService.updateNotice(noticeId, noticeInputDto);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/notice/{noticeId}")
	public ResponseEntity<Void> deleteNotice(
			@PathVariable Long noticeId
	) {
		helpService.deleteNotice(noticeId);
		return ResponseEntity.noContent().build();
	}
}
