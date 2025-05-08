package com.ssafy.damdam.domain.users.dto.user;

import com.ssafy.damdam.domain.users.entity.UserSurvey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserSurveyOutputDto {

    private Long surveyId;
    private Long userId;
    private String nickname;
    private int depression;
    private int anxiety;
    private int stress;
    private boolean suicide;
    private String stressReason;

    public static UserSurveyOutputDto fromEntity(UserSurvey survey) {
        return UserSurveyOutputDto.builder()
                .surveyId(survey.getSurveyId())
                .userId(survey.getUsers().getUserId())
                .nickname(survey.getUsers().getNickname())
                .depression(survey.getDepression())
                .anxiety(survey.getAnxiety())
                .stress(survey.getStress())
                .suicide(survey.isSuicide())
                .stressReason(survey.getStressReason())
                .build();
    }
}
