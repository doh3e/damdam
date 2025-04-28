package com.ssafy.damdam.domain.users.entity;

import com.ssafy.damdam.global.audit.BaseTimeEntityWithUpdatedAt;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name="user_setting")
public class UserSetting extends BaseTimeEntityWithUpdatedAt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "setting_id")
    private Long settingId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users users;

    @Column(name = "is_darkmode", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean isDarkmode;

    @Column(name = "bot_image", length = 255)
    private String botImage;

    @Column(name = "bot_custom", length = 255)
    private String botCustom;

    @Column(name = "is_alarm", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean isAlarm;

}
