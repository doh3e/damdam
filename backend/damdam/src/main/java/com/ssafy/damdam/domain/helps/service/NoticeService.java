package com.ssafy.damdam.domain.helps.service;

import java.util.List;

import com.ssafy.damdam.domain.helps.dto.NoticeInputDto;
import com.ssafy.damdam.domain.helps.dto.NoticeOutputDto;

public interface NoticeService {
	List<NoticeOutputDto> getNoticeList();

	void createNotice(NoticeInputDto noticeInputDto);

	NoticeOutputDto getNotice(Long noticeId);

	void updateNotice(Long noticeId, NoticeInputDto noticeInputDto);

	void deleteNotice(Long noticeId);
}
