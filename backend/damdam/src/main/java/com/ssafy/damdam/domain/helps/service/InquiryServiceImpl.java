package com.ssafy.damdam.domain.helps.service;

import static com.ssafy.damdam.domain.helps.exception.HelpExceptionCode.*;
import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ssafy.damdam.domain.helps.dto.AnswerInputDto;
import com.ssafy.damdam.domain.helps.dto.InquiryAndAnswerDto;
import com.ssafy.damdam.domain.helps.dto.InquiryInputDto;
import com.ssafy.damdam.domain.helps.entity.Answer;
import com.ssafy.damdam.domain.helps.entity.Inquiry;
import com.ssafy.damdam.domain.helps.exception.HelpException;
import com.ssafy.damdam.domain.helps.repository.AnswerRepository;
import com.ssafy.damdam.domain.helps.repository.InquiryRepository;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.global.aws.s3.S3FileUploadService;
import com.ssafy.damdam.global.mail.MailSendService;
import com.ssafy.damdam.global.util.user.UserUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryServiceImpl implements InquiryService {

	private final InquiryRepository inquiryRepository;
	private final AnswerRepository answerRepository;
	private final MailSendService mailSendService;
	private final S3FileUploadService s3FileUploadService;
	private final UserUtil userUtil;

	// 어드민 검증 메서드
	private boolean validateUserAdmin(Users user) {
		if (userUtil.isAdmin(user)) {
			throw new AuthException(INVALID_MEMBER_ROLE);
		}
		return true;
	}

	// 유저 검증 메서드
	private Users validateUser() {
		Users user = userUtil.getUser();
		if (user == null) {
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		return user;
	}

	@Override
	@Transactional
	public void createInquiry(InquiryInputDto inquiryinputDto, MultipartFile file) {

		Users user = userUtil.getUser();
		String fileUrl = null;
		if (file != null) {
			fileUrl = s3FileUploadService.uploadInquiryFile(file);
		}
		Inquiry inquiry = Inquiry.createInquiry(user, inquiryinputDto, fileUrl);

		inquiryinputDto.emailTextGenerator();
		mailSendService.sendEmail(inquiryinputDto.getEmail(), inquiryinputDto.getTitle(),
			inquiryinputDto.getContent(), fileUrl);

		inquiryRepository.save(inquiry);
	}

	@Override
	@Transactional
	public void createInquiryAnswer(Long inquiryId, AnswerInputDto answerInputDto) {
		Inquiry inquiry = inquiryRepository.findById(inquiryId).orElseThrow(
			() -> new HelpException(INQUIRY_NOT_FOUND));

		Answer answer = Answer.createAnswer(answerInputDto, inquiry);
		mailSendService.sendEmail(inquiry.getEmail(), inquiry.getTitle() + "에 대한 답변이 등록되었습니다.",
			answer.getContent(), null);

		inquiry.isAnswered();
		answerRepository.save(answer);
	}

	@Override
	public List<InquiryAndAnswerDto> getInquiryList() {
		Users user = validateUser();
		Long userId = user.getUserId();
		if (userUtil.isAdmin(user)) {
			return inquiryRepository.findAllInquiry();
		}
		return inquiryRepository.findByUsersUserId(userId);
	}
}
