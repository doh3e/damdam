package com.ssafy.damdam.domain.counsels.controller;

import java.net.URI;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.ssafy.damdam.domain.counsels.dto.CounselingChatListDto;
import com.ssafy.damdam.domain.counsels.dto.CounselingDto;
import com.ssafy.damdam.domain.counsels.dto.CreateCounselResponse;
import com.ssafy.damdam.domain.counsels.dto.CreateReportResponse;
import com.ssafy.damdam.domain.counsels.dto.PatchCounselTitleRequest;
import com.ssafy.damdam.domain.counsels.service.AiService;
import com.ssafy.damdam.domain.counsels.service.ChatService;
import com.ssafy.damdam.domain.counsels.service.CounselService;
import com.ssafy.damdam.domain.users.dto.auth.CustomOAuth2User;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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

	// 상담 방 내역 조회 + 이전 상담 내역 조회 (레디스 완, S3 개발중)
	@GetMapping("/{counsId}")
	public ResponseEntity<CounselingChatListDto> getCounsel
	(@PathVariable Long counsId) {
		CounselingChatListDto counselAndChatList = counselService.getCounsel(counsId);
		return ResponseEntity.ok(counselAndChatList);
	}

	@PatchMapping("/{counsId}")
	public ResponseEntity<Void> patchCounselTitle(
		@PathVariable Long counsId,
		@Valid @RequestBody PatchCounselTitleRequest req
	) {
		counselService.patchCounsel(counsId, req.getCounsTitle());
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{counsId}")
	public ResponseEntity<Void> deleteCounsel(@PathVariable Long counsId) {
		chatService.deleteRedisChatting(counsId);
		counselService.deleteCounsel(counsId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{counsId}")
	public ResponseEntity<Void> closeCounsel(@PathVariable Long counsId) {
		// RDB에서 isClosed 플래그 업데이트
		counselService.closeCounsel(counsId);
		// Redis에 쌓인 대화 이력 삭제
		chatService.deleteRedisChatting(counsId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{counsId}/reports")
	public ResponseEntity<CreateReportResponse> reportCounsel(
		@PathVariable Long counsId
	) throws JsonProcessingException {
		// 상담에 대한 레포트 발행 로직
		Long id = counselService.reportCounsel(counsId);
		// RDB에서 isClosed 플래그 업데이트
		counselService.closeCounsel(counsId);
		// Redis에 쌓인 대화 이력 삭제
		chatService.deleteRedisChatting(counsId);
		return ResponseEntity
			.created(URI.create(String.valueOf(id)))
			.body(new CreateReportResponse(id));
	}

}
