package com.ssafy.damdam.domain.counsels.dto;

import com.ssafy.damdam.domain.users.entity.Age;
import com.ssafy.damdam.domain.users.entity.Gender;
import com.ssafy.damdam.domain.users.entity.Mbti;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 유저의 개인 정보들 (백엔드 → LLM으로 채팅보낼 시 함께 보낼 정보들)
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserContextDto {
    private String botCustom;

    private Gender gender;
    private Age age;
    private String career;
    private Mbti mbti;

    private int depression;
    private int anxiety;
    private int stress;
    private Boolean isSuicidal;
    private String stressReason;
}
