package com.ssafy.damdam.domain.users.entity;

import com.ssafy.damdam.domain.users.dto.user.UserSettingDto;
import com.ssafy.damdam.global.audit.BaseTimeEntityWithUpdatedAt;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name = "user_setting")
public class UserSetting extends BaseTimeEntityWithUpdatedAt {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "setting_id")
	private Long settingId;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private Users users;

	@Column(name = "is_darkmode", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean isDarkmode;

	@Column(name = "bot_image", length = 255)
	private String botImage;

	@Column(name = "bot_custom", length = 255)
	private String botCustom;

	@Column(name = "is_alarm", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
	private boolean isAlarm;

	public static UserSetting createDefaultSetting(Users savedUser) {
		UserSetting setting = new UserSetting();
		setting.users = savedUser;
		setting.isDarkmode = false; // 다크모드 꺼짐
		setting.botImage = "";      // 기본 봇 이미지 없음
		setting.botCustom = "";     // 기본 봇 커스텀 없음
		setting.isAlarm = true;     // 알람은 기본적으로 켜짐
		return setting;
	}

	public static UserSetting createUserSetting(Users users, UserSettingDto dto) {
		UserSetting setting = new UserSetting();
		setting.users = users;
		setting.isDarkmode = dto.isDarkmode();
		setting.botImage = dto.getBotImage();
		setting.botCustom = dto.getBotCustom();
		setting.isAlarm = dto.isAlarm();
		return setting;
	}

	public void modifyDarkmode(boolean darkmode) {
		this.isDarkmode = darkmode;
	}

	public void modifyBotImage(String botImage) {
		this.botImage = botImage;
	}

	public void modifyBotCustom(String botCustom) {
		this.botCustom = botCustom;
	}

	public void modifyAlarm(boolean alarm) {
		this.isAlarm = alarm;
	}
}
