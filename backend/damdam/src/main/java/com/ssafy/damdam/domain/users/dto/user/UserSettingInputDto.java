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
public class UserSettingInputDto {

    private Boolean isDarkmode;
    private Boolean isAlarm;
    private String botImage;
    private String botCustom;

}
