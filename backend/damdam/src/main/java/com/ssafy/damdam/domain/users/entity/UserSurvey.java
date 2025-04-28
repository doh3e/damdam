package com.ssafy.damdam.domain.users.entity;

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

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users users;

    @Column(name = "depression", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int depression;

    @Column(name = "anxiety", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int anxiety;

    @Column(name = "stress", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int stress;

    @Column(name = "suicide", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean suicide;

    @Column(name = "stress_reason", length = 800)
    private String stressReason;

}
