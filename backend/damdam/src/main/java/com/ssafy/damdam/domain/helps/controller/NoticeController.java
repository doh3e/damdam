package com.ssafy.damdam.domain.helps.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.damdam.domain.helps.dto.NoticeInputDto;
import com.ssafy.damdam.domain.helps.dto.NoticeOutputDto;
import com.ssafy.damdam.domain.helps.service.NoticeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/damdam/helps/notice")
public class NoticeController {

	private final NoticeService noticeService;

	@GetMapping("")
	public ResponseEntity<List<NoticeOutputDto>> getNoticeList() {
		List<NoticeOutputDto> list = noticeService.getNoticeList();
		return ResponseEntity.ok(list);
	}

	@PostMapping("")
	public ResponseEntity<Void> createNotice(
		@RequestBody NoticeInputDto noticeInputDto
	) {
		noticeService.createNotice(noticeInputDto);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{noticeId}")
	public ResponseEntity<NoticeOutputDto> getNotice(
		@PathVariable Long noticeId
	) {
		NoticeOutputDto notice = noticeService.getNotice(noticeId);
		return ResponseEntity.ok(notice);
	}

	@PatchMapping("/{noticeId}")
	public ResponseEntity<Void> updateNotice(
		@PathVariable Long noticeId,
		@RequestBody NoticeInputDto noticeInputDto
	) {
		noticeService.updateNotice(noticeId, noticeInputDto);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{noticeId}")
	public ResponseEntity<Void> deleteNotice(
		@PathVariable Long noticeId
	) {
		noticeService.deleteNotice(noticeId);
		return ResponseEntity.noContent().build();
	}
}
