package com.ssafy.damdam.domain.helps.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ssafy.damdam.domain.helps.dto.AnswerInputDto;
import com.ssafy.damdam.domain.helps.dto.InquiryAndAnswerDto;
import com.ssafy.damdam.domain.helps.dto.InquiryInputDto;
import com.ssafy.damdam.domain.helps.service.InquiryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/damdam/helps/inquiry")
public class InquiryController {

	private final InquiryService inquiryService;

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> createInquiry(
		@RequestPart("inquiry") InquiryInputDto inquiryinputDto,
		@RequestPart(value = "file", required = false) MultipartFile file) {

		inquiryService.createInquiry(inquiryinputDto, file);

		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{inquiryId}/answer")
	public ResponseEntity<Void> createInquiryAnswer(
		@PathVariable Long inquiryId,
		@RequestBody AnswerInputDto answerInputDto) {

		inquiryService.createInquiryAnswer(inquiryId, answerInputDto);

		return ResponseEntity.noContent().build();
	}

	@GetMapping("")
	public ResponseEntity<List<InquiryAndAnswerDto>> getInquiryList(
	) {
		List<InquiryAndAnswerDto> list = inquiryService.getInquiryList();
		return ResponseEntity.ok(list);
	}
}
