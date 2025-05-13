package com.ssafy.damdam.domain.helps.dto;

import com.ssafy.damdam.domain.helps.entity.Notice;
import com.ssafy.damdam.domain.helps.entity.NoticeCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeOutputDto {
    private Long noticeId;
    private NoticeCategory noticeCategory;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoticeOutputDto fromEntity(Notice notice) {
        return NoticeOutputDto.builder()
                .noticeId(notice.getNoticeId())
                .noticeCategory(notice.getCategory())
                .title(notice.getTitle())
                .content(notice.getContent())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .build();
    }
}
