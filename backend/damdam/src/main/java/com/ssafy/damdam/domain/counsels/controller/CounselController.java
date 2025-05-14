package com.ssafy.damdam.domain.counsels.controller;

import java.net.URI;
import java.security.Principal;
import java.util.List;

import com.ssafy.damdam.domain.counsels.service.AiService;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ssafy.damdam.domain.counsels.dto.CounselingDto;
import com.ssafy.damdam.domain.counsels.dto.CreateCounselResponse;
import com.ssafy.damdam.domain.counsels.dto.PatchCounselTitleRequest;
import com.ssafy.damdam.domain.counsels.service.ChatService;
import com.ssafy.damdam.domain.counsels.service.CounselService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/damdam/counsels")
public class CounselController {

	private final CounselService counselService;
	private final ChatService chatService;
	private final AiService aiService;
	private final S3FileUploadService s3FileUploadService;

	@GetMapping("")
	public ResponseEntity<List<CounselingDto>> showCounselList() {
		List<CounselingDto> list = counselService.getCounselList();
		return ResponseEntity.ok(list);
	}

	@PostMapping("")
	public ResponseEntity<CreateCounselResponse> createCounsel() {
		Long id = counselService.createCounsel();
		return ResponseEntity
			.created(URI.create(String.valueOf(id)))
			.body(new CreateCounselResponse(id));
	}

	@PostMapping("/{counsId}/voice")
	public ResponseEntity<String> uploadAudio(
			@PathVariable Long counsId,
			@RequestParam MultipartFile file,
			@RequestParam int messageOrder,
			Principal principal
	) {
		String audioUrl = s3FileUploadService.uploadAudio(file, "audio");
		Long userId = Long.valueOf(principal.getName());
		aiService.analyzeAndSave(counsId, userId, messageOrder, audioUrl);
		return ResponseEntity.ok(audioUrl);
	}

	// 상담 방 내역 조회 + 이전 상담 내역 S3에서 뽑아오기 (추후 개발)
	@GetMapping("/{counsId}")
	public ResponseEntity<CounselingDto> getCounsel(@PathVariable Long counsId) {
		return ResponseEntity.ok(counselService.getCounsel(counsId));
	}

	@PatchMapping("/{counsId}")
	public ResponseEntity<String> patchCounselTitle(
		@PathVariable Long counsId,
		@Valid @RequestBody PatchCounselTitleRequest req
	) {
		counselService.patchCounsel(counsId, req.getCounsTitle());
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{counsId}")
	public ResponseEntity<String> deleteCounsel(@PathVariable Long counsId) {
		counselService.deleteCounsel(counsId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{counsId}")
	public ResponseEntity<Void> closeCounsel(@PathVariable Long counsId) {
		// RDB에서 isClosed 플래그 업데이트
		counselService.closeCounsel(counsId);

		// Redis에 쌓인 대화 이력 삭제
		chatService.endCounsel(counsId);

		return ResponseEntity.noContent().build();
	}

}
