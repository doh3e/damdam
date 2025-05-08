package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.dto.ChatOutputDto;
import com.ssafy.damdam.domain.users.entity.UserInfo;
import com.ssafy.damdam.domain.users.entity.UserSetting;

public interface AiService {
    ChatOutputDto analyzeAndRespond(
            Long roomId,
            Long userId,
            ChatInputDto input,
            int remainingTokens,
            UserInfo userInfo,
            UserSetting userSetting
    );
}
