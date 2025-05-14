package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.ChatInputDto;

public interface AiService {
    void analyzeAndSave(Long roomId, Long userId, int messageOrder, String audioUrl);
}
