package com.ssafy.damdam.domain.users.dto.user;

import com.ssafy.damdam.domain.users.entity.UserSetting;
import com.ssafy.damdam.domain.users.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingDto {

    private Users user;
    private boolean isDarkmode;
    private boolean isAlarm;
    private String botImage;
    private String botCustom;

    public static UserSettingDto fromEntity(UserSetting usersetting) {
        return UserSettingDto.builder()
                .user(usersetting.getUsers())
                .isDarkmode(usersetting.isDarkmode())
                .isAlarm(usersetting.isAlarm())
                .botImage(usersetting.getBotImage())
                .botCustom(usersetting.getBotCustom())
                .build();
    }

    public UserSetting toEntity() {
        return UserSetting.createUserSetting(this);
    }

}
