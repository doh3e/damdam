package com.ssafy.damdam.domain.counsels.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptDto {
    private Long counsId;
    private Long userId;
    private List<ChatRecordDto> messageList;
}
