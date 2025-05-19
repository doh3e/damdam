package com.ssafy.damdam.domain.helps.service;

import static com.ssafy.damdam.domain.helps.exception.HelpExceptionCode.*;
import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.helps.dto.NoticeInputDto;
import com.ssafy.damdam.domain.helps.dto.NoticeOutputDto;
import com.ssafy.damdam.domain.helps.entity.Notice;
import com.ssafy.damdam.domain.helps.exception.HelpException;
import com.ssafy.damdam.domain.helps.repository.AnswerRepository;
import com.ssafy.damdam.domain.helps.repository.InquiryRepository;
import com.ssafy.damdam.domain.helps.repository.NoticeRepository;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.global.util.user.UserUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeServiceImpl implements NoticeService {

	private final AnswerRepository answerRepository;
	private final InquiryRepository inquiryRepository;
	private final NoticeRepository noticeRepository;
	private final UserUtil userUtil;

	// 어드민 검증 메서드
	private void validateUserAdmin() {
		Users user = userUtil.getUser();
		if (user == null) {
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		if (userUtil.isAdmin(user)) {
			throw new AuthException(INVALID_MEMBER_ROLE);
		}
	}

	@Override
	public List<NoticeOutputDto> getNoticeList() {
		return noticeRepository.findAllByOrderByCreatedAtDesc().stream()
			.map(NoticeOutputDto::fromEntity)
			.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public void createNotice(NoticeInputDto noticeInputDto) {
		validateUserAdmin();
		noticeRepository.save(Notice.from(noticeInputDto));
	}

	@Override
	public NoticeOutputDto getNotice(Long noticeId) {
		Notice notice = noticeRepository.findById(noticeId)
			.orElseThrow(() -> new HelpException(NOTICE_NOT_FOUND));

		return NoticeOutputDto.fromEntity(notice);
	}

	@Override
	public void updateNotice(Long noticeId, NoticeInputDto noticeInputDto) {
		validateUserAdmin();
		Notice notice = noticeRepository.findById(noticeId)
			.orElseThrow(() -> new HelpException(NOTICE_NOT_FOUND));

		notice.updateNotice(noticeInputDto);
	}

	@Override
	public void deleteNotice(Long noticeId) {
		validateUserAdmin();
		Notice notice = noticeRepository.findById(noticeId)
			.orElseThrow(() -> new HelpException(NOTICE_NOT_FOUND));

		noticeRepository.delete(notice);
	}
}
