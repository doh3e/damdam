package com.ssafy.damdam.domain.users.controller;

import com.ssafy.damdam.domain.users.dto.user.*;
import com.ssafy.damdam.domain.users.entity.Age;
import com.ssafy.damdam.domain.users.entity.Gender;
import com.ssafy.damdam.domain.users.entity.Mbti;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
		@RequestPart(value = "nickname", required = true) String nickname,
		@RequestPart(value = "age", required = false) String age,
		@RequestPart(value = "gender", required = false) String gender,
		@RequestPart(value = "career", required = false) String career,
		@RequestPart(value = "mbti", required = false) String mbti,
		@RequestPart(value = "profileImage", required = false) MultipartFile file
	) throws IOException {

		ProfileInputDto profileInputDto = ProfileInputDto.builder()
			.nickname(nickname)
			.age(Age.valueOf(age))
			.gender(Gender.valueOf(gender))
			.career(career)
			.mbti(Mbti.valueOf(mbti))
			.build();

		userService.editUserProfile(profileInputDto, file);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/setting")
	public ResponseEntity<UserSettingOutputDto> getSetting() {
		UserSettingOutputDto dto = userService.getUserSetting();
		return ResponseEntity.ok(dto);
	}

	@PatchMapping(value = "/setting", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> patchSetting(
			@RequestPart (value = "isDarkmode", required = true) Boolean isDarkmode,
			@RequestPart (value = "isAlarm", required = true) Boolean isAlarm,
			@RequestPart (value = "botCustom", required = false) String botCustom,
			@RequestPart (value = "botImage", required = false) MultipartFile file
	) throws IOException {

		UserSettingInputDto userSettingInputDto = UserSettingInputDto.builder()
			.isDarkmode(isDarkmode)
			.isAlarm(isAlarm)
			.botCustom(botCustom)
			.build();

		userService.editUserSetting(userSettingInputDto, file);
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
