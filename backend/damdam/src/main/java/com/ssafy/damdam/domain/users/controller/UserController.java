package com.ssafy.damdam.domain.users.controller;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ssafy.damdam.domain.users.dto.user.ProfileInputDto;
import com.ssafy.damdam.domain.users.dto.user.ProfileOutputDto;
import com.ssafy.damdam.domain.users.dto.user.UserSettingInputDto;
import com.ssafy.damdam.domain.users.dto.user.UserSettingOutputDto;
import com.ssafy.damdam.domain.users.dto.user.UserSurveyInputDto;
import com.ssafy.damdam.domain.users.dto.user.UserSurveyOutputDto;
import com.ssafy.damdam.domain.users.entity.Age;
import com.ssafy.damdam.domain.users.entity.Gender;
import com.ssafy.damdam.domain.users.entity.Mbti;
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

	@PatchMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> patchProfile(
		@RequestParam(value = "nickname", required = true) String nickname,
		@RequestParam(value = "age", required = false) String age,
		@RequestParam(value = "gender", required = false) String gender,
		@RequestParam(value = "career", required = false) String career,
		@RequestParam(value = "mbti", required = false) String mbti,
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
		@RequestParam(value = "isDarkmode", required = true) Boolean isDarkmode,
		@RequestParam(value = "isAlarm", required = true) Boolean isAlarm,
		@RequestParam(value = "botCustom", required = false) String botCustom,
		@RequestPart(value = "botImage", required = false) MultipartFile file
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
