package com.ssafy.damdam.domain.users.entity;

import com.ssafy.damdam.global.audit.BaseTimeEntityWithUpdatedAt;

import jakarta.persistence.*;
import lombok.Getter;

@Getter
@Entity
@Table(name = "user_info")
public class UserInfo extends BaseTimeEntityWithUpdatedAt {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "info_id")
	private Long infoId;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private Users users;

	@Enumerated(EnumType.STRING)
	@Column(name = "gender", length = 20)
	private Gender gender;

	@Enumerated(EnumType.STRING)
	@Column(name = "age", length = 20)
	private Age age;

	@Column(name = "career", length = 100)
	private String career;

	@Column(name = "mbti", length = 4)
	private String mbti;

	public static UserInfo createDefaultInfo(Users user) {
		UserInfo userInfo = new UserInfo();
		userInfo.users = user;
		userInfo.gender = Gender.UNKNOWN;
		userInfo.age = Age.TWENTIES;
		userInfo.career = "";
		userInfo.mbti = "";
		return userInfo;
	}
}
