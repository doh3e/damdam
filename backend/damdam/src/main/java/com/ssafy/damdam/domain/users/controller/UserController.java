package com.ssafy.damdam.domain.users.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ssafy.damdam.domain.users.dto.user.ProfileInputDto;
import com.ssafy.damdam.domain.users.dto.user.ProfileOutputDto;
import com.ssafy.damdam.domain.users.dto.user.UserSettingDto;
import com.ssafy.damdam.domain.users.dto.user.UserSurveyInputDto;
import com.ssafy.damdam.domain.users.dto.user.UserSurveyOutputDto;
import com.ssafy.damdam.domain.users.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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

	@PatchMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> patchProfile(
		@RequestPart(value = "profileInputDto", required = false) ProfileInputDto profileInputDto,
		@RequestPart(value = "profileImage", required = false) MultipartFile file
	) throws IOException {
		userService.editUserProfile(profileInputDto, file);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/setting")
	public ResponseEntity<UserSettingDto> getSetting() {
		UserSettingDto dto = userService.getUserSetting();
		return ResponseEntity.ok(dto);
	}

	@PatchMapping(value = "/setting", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> patchSetting(
		@RequestPart (value = "userSettingDto", required = false) UserSettingDto userSettingDto,
		@RequestPart (value = "botImage", required = false) MultipartFile file
	) throws IOException {
		userService.editUserSetting(userSettingDto, file);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/survey")
	public ResponseEntity<UserSurveyOutputDto> getSurvey() {
		UserSurveyOutputDto survey = userService.getSurvey();
		return ResponseEntity.ok(survey);
	}

	@PostMapping("/survey")
	public ResponseEntity<Void> postSurvey(
		@RequestBody UserSurveyInputDto survey
	) {
		userService.postSurvey(survey);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/survey")
	public ResponseEntity<Void> deleteSurvey() {
		userService.deleteSurvey();
		return ResponseEntity.noContent().build();
	}

}
