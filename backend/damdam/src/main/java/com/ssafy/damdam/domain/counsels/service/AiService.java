package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;
import com.ssafy.damdam.domain.counsels.dto.ChatOutputDto;

public interface AiService {
    void analyzeAndSave(Long roomId, Long userId, String nickname, int messageOrder, String audioUrl);

    ChatOutputDto chatWithLlm(Long roomId, Long userId, String nickname, ChatInputDto input);
}
