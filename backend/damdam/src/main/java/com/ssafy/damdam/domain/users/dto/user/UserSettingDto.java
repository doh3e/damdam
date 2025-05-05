package com.ssafy.damdam.domain.users.dto.user;

import com.ssafy.damdam.domain.users.entity.UserSetting;
import com.ssafy.damdam.domain.users.entity.Users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingDto {

	// 유저 요약 정보
	private String nickname;
	private String email;
	private String profileImage;

	// 봇 정보
	private boolean isDarkmode;
	private boolean isAlarm;
	private String botImage;
	private String botCustom;

	public static UserSettingDto fromEntity(UserSetting setting) {
		return UserSettingDto.builder()
			.nickname(setting.getUsers().getNickname())
			.email(setting.getUsers().getEmail())
			.profileImage(setting.getUsers().getProfileImage())
			.isDarkmode(setting.isDarkmode())
			.isAlarm(setting.isAlarm())
			.botImage(setting.getBotImage())
			.botCustom(setting.getBotCustom())
			.build();
	}

	public UserSetting toEntity(Users users) {
		return UserSetting.createUserSetting(users, this);
	}

}
