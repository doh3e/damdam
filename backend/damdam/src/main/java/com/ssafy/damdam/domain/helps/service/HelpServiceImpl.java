package com.ssafy.damdam.domain.helps.service;

import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;

import com.ssafy.damdam.domain.helps.dto.NoticeOutputDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.helps.repository.AnswerRepository;
import com.ssafy.damdam.domain.helps.repository.InquiryRepository;
import com.ssafy.damdam.domain.helps.repository.NoticeRepository;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.global.util.user.UserUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HelpServiceImpl implements HelpService {

	private final AnswerRepository answerRepository;
	private final InquiryRepository inquiryRepository;
	private final NoticeRepository noticeRepository;
	private final UserUtil userUtil;

	// 유저 검증 메서드
	private Users validateUser() {
		Users user = userUtil.getUser();
		if (user == null) {
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		return user;
	}

	@Override
	public List<NoticeOutputDto> getNoticeList() {
		return List.of();
	}
}
