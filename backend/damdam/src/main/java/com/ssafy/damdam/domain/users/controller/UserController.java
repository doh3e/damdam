package com.ssafy.damdam.domain.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.damdam.domain.users.dto.user.ProfileInputDto;
import com.ssafy.damdam.domain.users.dto.user.ProfileOutputDto;
import com.ssafy.damdam.domain.users.dto.user.UserSettingDto;
import com.ssafy.damdam.domain.users.dto.user.UserSurveyInputDto;
import com.ssafy.damdam.domain.users.dto.user.UserSurveyOutputDto;
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
		return ResponseEntity.noContent().build();
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
		return ResponseEntity.noContent().build();
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
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/survey")
	public ResponseEntity<String> deleteSurvey() {
		userService.deleteSurvey();
		return ResponseEntity.noContent().build();
	}

}
