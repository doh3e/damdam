package com.ssafy.damdam.domain.users.service;

import com.ssafy.damdam.domain.users.dto.user.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface UserService {

	ProfileOutputDto getUserProfile();

	void editUserProfile(ProfileInputDto profileInputDto, MultipartFile file) throws IOException;

	UserSettingOutputDto getUserSetting();

	void editUserSetting(UserSettingInputDto userSettingInputDto, MultipartFile file) throws IOException;

    UserSurveyOutputDto getSurvey();

	void postSurvey(UserSurveyInputDto survey);

	void deleteSurvey();
}
