package com.ssafy.damdam.domain.users.service;

import com.ssafy.damdam.domain.users.dto.user.*;

public interface UserService {

	ProfileOutputDto getUserProfile();

	void editUserProfile(ProfileInputDto profileInputDto);

	UserSettingDto getUserSetting();

	void editUserSetting(UserSettingDto userSettingDto);

    UserSurveyOutputDto getSurvey();

	void postSurvey(UserSurveyInputDto survey);

	void deleteSurvey();
}
