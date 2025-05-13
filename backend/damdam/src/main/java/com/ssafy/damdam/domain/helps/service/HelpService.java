package com.ssafy.damdam.domain.helps.service;

import com.ssafy.damdam.domain.helps.dto.NoticeOutputDto;

import java.util.List;

public interface HelpService {
    List<NoticeOutputDto> getNoticeList();
}
