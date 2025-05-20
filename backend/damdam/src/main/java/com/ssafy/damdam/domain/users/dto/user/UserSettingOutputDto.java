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
public class UserSettingOutputDto {

	// 유저 요약 정보
	private String nickname;
	private String email;

	// 봇 정보
	private Boolean isDarkmode;
	private Boolean isAlarm;
	private String botImage;
	private String botCustom;

	public static UserSettingOutputDto fromEntity(UserSetting setting) {
		return UserSettingOutputDto.builder()
			.nickname(setting.getUsers().getNickname())
			.email(setting.getUsers().getEmail())
			.isDarkmode(setting.getIsDarkmode())
			.isAlarm(setting.getIsAlarm())
			.botImage(setting.getBotImage())
			.botCustom(setting.getBotCustom())
			.build();
	}

}
