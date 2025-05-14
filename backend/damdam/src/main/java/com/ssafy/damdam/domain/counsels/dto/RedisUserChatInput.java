package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Redis에 저장될 유저 메시지용 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedisUserChatInput {

    private String sender;

    private Boolean isVoice;

    private int messageOrder;

    private String message;

    private LocalDateTime timestamp;
}
