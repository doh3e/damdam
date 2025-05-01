package com.ssafy.damdam.domain.users.service;

import com.ssafy.damdam.domain.users.dto.user.ProfileInputDto;
import com.ssafy.damdam.domain.users.dto.user.ProfileOutputDto;
import com.ssafy.damdam.domain.users.dto.user.UserSettingDto;

public interface UserService {

	ProfileOutputDto getUserProfile();

	void editUserProfile(ProfileInputDto profileInputDto);

	UserSettingDto getUserSetting();

	void editUserSetting(UserSettingDto userSettingDto);
}
