package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


// 단일 건의 채팅 메세지 기록을 redis에 저장, 조회하기 위해 사용됨
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private String sender;
    private Boolean isVoice;
    private int messageOrder;
    private String message;
    private LocalDateTime timestamp;
    private EmotionDto emotion;  // 분석 전엔 null, 분석 후 채워줌
}
