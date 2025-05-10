package com.ssafy.damdam.domain.users.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserSurveyInputDto {

    private int depression;
    private int anxiety;
    private int stress;
    private boolean suicide;
    private String stressReason;
}
