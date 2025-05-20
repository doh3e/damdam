package com.ssafy.damdam.domain.helps.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.ssafy.damdam.domain.helps.dto.AnswerInputDto;
import com.ssafy.damdam.domain.helps.dto.InquiryAndAnswerDto;
import com.ssafy.damdam.domain.helps.dto.InquiryInputDto;

public interface InquiryService {
	void createInquiry(InquiryInputDto inquiryinputDto, MultipartFile file);

	void createInquiryAnswer(Long inquiryId, AnswerInputDto answerInputDto);

	List<InquiryAndAnswerDto> getInquiryList();
}
