package com.ssafy.damdam.domain.helps.repository;

import java.util.List;

import com.ssafy.damdam.domain.helps.dto.InquiryAndAnswerDto;

public interface InquiryRepositoryCustom {

	List<InquiryAndAnswerDto> findAllInquiry();

	List<InquiryAndAnswerDto> findByUsersUserId(Long userId);
}
