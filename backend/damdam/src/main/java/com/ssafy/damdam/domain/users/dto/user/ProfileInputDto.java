package com.ssafy.damdam.domain.users.dto.user;

import com.ssafy.damdam.domain.users.entity.Age;
import com.ssafy.damdam.domain.users.entity.Gender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileInputDto {
	// 기본 가입 정보
	private String nickname;
	private String profileImage;

	// 유저 추가 입력 정보
	private Gender gender;
	private Age age;
	private String career;
	private String mbti;
}
