package com.ssafy.damdam.domain.helps.service;

import com.ssafy.damdam.domain.helps.dto.NoticeInputDto;
import com.ssafy.damdam.domain.helps.dto.NoticeOutputDto;

import java.util.List;

public interface HelpService {
    List<NoticeOutputDto> getNoticeList();

    void createNotice(NoticeInputDto noticeInputDto);

    NoticeOutputDto getNotice(Long noticeId);

    void updateNotice(Long noticeId, NoticeInputDto noticeInputDto);

    void deleteNotice(Long noticeId);
}
