package com.ssafy.damdam.domain.counsels.controller;

import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.concurrent.ExecutionException;

import com.ssafy.damdam.domain.counsels.service.AiService;
import com.ssafy.damdam.domain.reports.dto.SessionReportOutputDto;
import com.ssafy.damdam.domain.users.dto.auth.CustomOAuth2User;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

	@PostMapping(
			value = "/{counsId}/voice",
			consumes = MediaType.MULTIPART_FORM_DATA_VALUE
	)
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@Operation(
			summary = "상담방 음성 메시지 업로드",
			description = "음성 파일과 messageOrder를 multipart/form-data로 전송합니다."
	)
	public void uploadAudio(
			@PathVariable Long counsId,
			@RequestParam("file")
			@Parameter(description = "업로드할 오디오 파일", required = true, content = @Content(schema = @Schema(type = "string", format = "binary")))
			MultipartFile file,

			@RequestParam("messageOrder")
			@Parameter(description = "메시지 순서", required = true)
			int messageOrder,

			@AuthenticationPrincipal CustomOAuth2User user
	) throws ExecutionException, InterruptedException {
		chatService.handleVoiceMessage(
				counsId,
				user.getUserId(),
				messageOrder,
				file
		);
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

	@PostMapping("/{counsId}/reports")
	public ResponseEntity<SessionReportOutputDto> reportCounsel(
		@PathVariable Long counsId
	) {
		SessionReportOutputDto dto = counselService.reportCounsel(counsId);
		return ResponseEntity.ok(dto);
	}

}
