package com.ssafy.damdam.domain.helps.dto;

import com.ssafy.damdam.domain.helps.entity.NoticeCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeInputDto {
    private NoticeCategory category;
    private String title;
    private String content;
}
