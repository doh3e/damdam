package com.ssafy.damdam.domain.users.dto.user;

import com.ssafy.damdam.domain.users.entity.Age;
import com.ssafy.damdam.domain.users.entity.Gender;
import com.ssafy.damdam.domain.users.entity.Mbti;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserContextDto {
    private String botImage;
    private String botCustom;
    private Boolean isAlarm;

    private Gender gender;
    private Age age;
    private String career;
    private Mbti mbti;

    private int depression;
    private int anxiety;
    private int stress;
    private boolean suicide;
    private String stressReason;
}
