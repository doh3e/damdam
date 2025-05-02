package com.ssafy.damdam.domain.users.dto.user;

import com.ssafy.damdam.domain.users.entity.Age;
import com.ssafy.damdam.domain.users.entity.Gender;
import com.ssafy.damdam.domain.users.entity.Provider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileOutputDto {

    // 기본 가입 정보
    private Provider provider;
    private String nickname;
    private String email;
    private String profileImage;
    
    // 유저 추가 입력 정보
    private Gender gender;
    private Age age;
    private String career;
    private String mbti;

}
