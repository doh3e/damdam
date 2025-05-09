package com.ssafy.damdam.domain.users.controller;

import com.ssafy.damdam.domain.users.dto.user.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ssafy.damdam.domain.users.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/damdam/users")
public class UserController {

	private final UserService userService;

	@GetMapping("/profile")
	public ResponseEntity<ProfileOutputDto> getProfile() {
		ProfileOutputDto dto = userService.getUserProfile();
		return ResponseEntity.ok(dto);
	}

	@PatchMapping("/profile")
	public ResponseEntity<String> patchProfile(
		@RequestBody ProfileInputDto profileInputDto
	) {
		userService.editUserProfile(profileInputDto);
		return ResponseEntity.ok().body("프로필 수정이 완료되었습니다.");
	}

	@GetMapping("/setting")
	public ResponseEntity<UserSettingDto> getSetting() {
		UserSettingDto dto = userService.getUserSetting();
		return ResponseEntity.ok(dto);
	}

	@PatchMapping("/setting")
	public ResponseEntity<String> patchSetting(
		@RequestBody UserSettingDto userSettingDto
	) {
		userService.editUserSetting(userSettingDto);
		return ResponseEntity.ok().body("시스템 설정 수정이 완료되었습니다.");
	}

	@GetMapping("/survey")
	public ResponseEntity<UserSurveyOutputDto> getSurvey() {
		UserSurveyOutputDto survey = userService.getSurvey();
		return ResponseEntity.ok(survey);
	}

	@PostMapping("/survey")
	public ResponseEntity<String> postSurvey(
			@RequestBody UserSurveyInputDto survey
	) {
		userService.postSurvey(survey);
		return ResponseEntity.ok().body("사전 설문조사 응답이 완료되었습니다.");
	}

	@DeleteMapping("/survey")
	public ResponseEntity<String> deleteSurvey() {
		userService.deleteSurvey();
		return ResponseEntity.ok().body("사전 설문조사 응답이 삭제되었습니다.");
	}

}
