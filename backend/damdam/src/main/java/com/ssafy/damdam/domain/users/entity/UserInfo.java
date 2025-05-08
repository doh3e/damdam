package com.ssafy.damdam.domain.users.entity;

import com.ssafy.damdam.global.audit.BaseTimeEntityWithUpdatedAt;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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

	@Enumerated(EnumType.STRING)
	@Column(name = "mbti", length = 8)
	private Mbti mbti;

	public static UserInfo createDefaultInfo(Users user) {
		UserInfo userInfo = new UserInfo();
		userInfo.users = user;
		userInfo.gender = Gender.UNKNOWN;
		userInfo.age = Age.UNKNOWN;
		userInfo.career = "";
		userInfo.mbti = Mbti.UNKNOWN;
		return userInfo;
	}

	public void modifyGender(Gender gender) {
		this.gender = gender;
	}

	public void modifyAge(Age age) {
		this.age = age;
	}

	public void modifyCareer(String career) {
		this.career = career;
	}

	public void modifyMbti(Mbti mbti) {
		this.mbti = mbti;
	}
}
