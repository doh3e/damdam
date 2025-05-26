package com.ssafy.damdam.domain.users.entity;

import com.ssafy.damdam.domain.users.dto.user.UserSurveyInputDto;
import com.ssafy.damdam.global.audit.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name = "user_survey")
public class UserSurvey extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "survey_id")
    private Long surveyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users users;

    @Column(name = "depression", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int depression;

    @Column(name = "anxiety", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int anxiety;

    @Column(name = "stress", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int stress;

    @Column(name = "is_suicidal", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isSuicidal;

    @Column(name = "stress_reason", length = 200)
    private String stressReason;

    protected UserSurvey() { }

    public static UserSurvey of(Users user, UserSurveyInputDto dto) {
        UserSurvey survey = new UserSurvey();
        survey.users        = user;
        survey.depression   = dto.getDepression();
        survey.anxiety      = dto.getAnxiety();
        survey.stress       = dto.getStress();
        survey.isSuicidal      = dto.getIsSuicidal();
        survey.stressReason = dto.getStressReason();
        return survey;
    }

}
