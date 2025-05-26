package com.ssafy.damdam.domain.users.service;

import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;
import static com.ssafy.damdam.domain.users.exception.user.UserExceptionCode.USER_SURVEY_NOT_FOUND;

import com.ssafy.damdam.domain.users.dto.user.*;
import com.ssafy.damdam.domain.users.entity.UserSurvey;
import com.ssafy.damdam.domain.users.exception.user.UserException;
import com.ssafy.damdam.domain.users.repository.UserSurveyRepository;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.users.entity.UserInfo;
import com.ssafy.damdam.domain.users.entity.UserSetting;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import com.ssafy.damdam.domain.users.repository.UsersRepository;
import com.ssafy.damdam.global.util.user.UserUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

	private final UsersRepository usersRepository;
	private final UserInfoRepository userInfoRepository;
	private final UserSettingRepository userSettingRepository;
	private final UserUtil userUtil;
	private final UserSurveyRepository userSurveyRepository;
	private final S3FileUploadService s3FileUploadService;

	// 유저 검증 메서드
	private Users validateUser() {
		Users user = userUtil.getUser();
		if (user == null) {
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		return user;
	}

	@Override
	public ProfileOutputDto getUserProfile() {
		Users user = validateUser();

		Users userOrigin = usersRepository.findById(user.getUserId())
			.orElseThrow(() -> new AuthException(AUTH_MEMBER_NOT_FOUND));

		UserInfo userInfo = userInfoRepository
			.findByUsers_UserId(user.getUserId())
			.orElseThrow(() -> new AuthException(AUTH_MEMBER_NOT_FOUND));

		return new ProfileOutputDto(
			userOrigin.getProvider(),
			userOrigin.getNickname(),
			userOrigin.getEmail(),
			userOrigin.getProfileImage(),
			userInfo.getGender(),
			userInfo.getAge(),
			userInfo.getCareer(),
			userInfo.getMbti()
		);
	}

	@Override
	@Transactional
	public void editUserProfile(ProfileInputDto dto, MultipartFile file) throws IOException {
		Users user = validateUser();

		Users userOrigin = usersRepository.findById(user.getUserId())
				.orElseThrow(() -> new AuthException(AUTH_MEMBER_NOT_FOUND));
		UserInfo userInfo = userInfoRepository.findByUsers_UserId(user.getUserId())
				.orElseThrow(() -> new AuthException(AUTH_MEMBER_NOT_FOUND));

		if (file != null && !file.isEmpty()) {
			String imageUrl = s3FileUploadService.uploadFile(file, "profile_images", userOrigin.getProfileImage());
			userOrigin.modifyProfileUrl(imageUrl);
		}

		if (dto != null) {
			if (dto.getNickname() != null) {
				userOrigin.modifyNickname(dto.getNickname());
			}
			if (dto.getGender() != null) {
				userInfo.modifyGender(dto.getGender());
			}
			if (dto.getAge() != null) {
				userInfo.modifyAge(dto.getAge());
			}
			if (dto.getCareer() != null) {
				userInfo.modifyCareer(dto.getCareer());
			}
			if (dto.getMbti() != null) {
				userInfo.modifyMbti(dto.getMbti());
			}
		}

	}

	@Override
	public UserSettingOutputDto getUserSetting() {
		Users user = validateUser();
		UserSetting setting = userSettingRepository
			.findByUsers_UserId(user.getUserId())
			.orElseThrow(() -> new AuthException(AUTH_MEMBER_NOT_FOUND));

		return UserSettingOutputDto.fromEntity(setting);
	}

	@Override
	@Transactional
	public void editUserSetting(UserSettingInputDto dto, MultipartFile file) throws IOException {
		Users user = validateUser();
		UserSetting setting = userSettingRepository
			.findByUsers_UserId(user.getUserId())
			.orElseThrow(() -> new AuthException(AUTH_MEMBER_NOT_FOUND));

		if (file != null && !file.isEmpty()) {
			String imageUrl = s3FileUploadService.uploadFile(file, "bot_images", setting.getBotImage());
			setting.modifyBotImage(imageUrl);
		}
		if (dto != null) {
			setting.modifyDarkmode(dto.getIsDarkmode());
			if (dto.getBotCustom() != null)
				setting.modifyBotCustom(dto.getBotCustom());
			setting.modifyAlarm(dto.getIsAlarm());
		}
	}

	@Override
	public UserSurveyOutputDto getSurvey() {
		Users user = validateUser();

		UserSurvey survey = userSurveyRepository
				.findByUsers_UserId(user.getUserId()).orElse(null);

		return UserSurveyOutputDto.fromEntity(survey);
	}

	@Override
	@Transactional
	public void postSurvey(UserSurveyInputDto survey) {
		Users user = validateUser();
		UserSurvey newSurvey = UserSurvey.of(user, survey);
		userSurveyRepository.save(newSurvey);
	}

	@Override
	@Transactional
	public void deleteSurvey() {
		Users user = validateUser();
		UserSurvey survey = userSurveyRepository
			.findByUsers_UserId(user.getUserId()).orElse(null);

		if (survey == null) {
			throw new UserException(USER_SURVEY_NOT_FOUND);
		}
		userSurveyRepository.delete(survey);
	}
}
