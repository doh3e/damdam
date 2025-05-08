package com.ssafy.damdam.domain.users.entity;

import java.time.LocalDateTime;

import com.ssafy.damdam.domain.users.dto.auth.UserDto;
import com.ssafy.damdam.global.audit.BaseTimeEntityWithUpdatedAt;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name = "users")
public class Users extends BaseTimeEntityWithUpdatedAt {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
	private Long userId;

	@Column(name = "email", nullable = false, unique = true, length = 100)
	private String email;

	@Column(name = "profile_image")
	private String profileImage;

	@Column(name = "nickname", length = 20)
	private String nickname;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false, length = 20)
	private Role role;

	@Enumerated(EnumType.STRING)
	@Column(name = "provider", nullable = false, length = 20)
	private Provider provider;

	@Column(name = "personal_id")
	private String personalId;

	@Column(name = "last_login")
	private LocalDateTime lastLogin;

	public static Users createUser(UserDto userDto) {
		Users users = new Users();
		users.email = userDto.getEmail();
		users.profileImage = "";
		users.nickname = userDto.getNickname();
		users.role = Role.ROLE_USER;
		users.provider = userDto.getProvider();
		users.personalId = userDto.getPersonalId();
		users.lastLogin = LocalDateTime.now();
		return users;
	}

	public void updateLastLogin() {
		this.lastLogin = LocalDateTime.now();
	}

	public void modifyNickname(String nickname) {
		this.nickname = nickname;
	}

	public void modifyProfileUrl(String profileImage) {
		this.profileImage = profileImage;
	}

	public void changeAdmin() {
		this.role = Role.ROLE_ADMIN;
	}

	public void changeUser() {
		this.role = Role.ROLE_USER;
	}

}
