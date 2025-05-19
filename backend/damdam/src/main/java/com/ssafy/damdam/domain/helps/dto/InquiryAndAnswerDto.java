package com.ssafy.damdam.domain.helps.dto;

import java.time.LocalDateTime;

import com.querydsl.core.annotations.QueryProjection;
import com.ssafy.damdam.domain.helps.entity.Category;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class InquiryAndAnswerDto {

	//문의한 사용자 Pk
	private Long userId;

	//문의 자체 PK
	private Integer inquiryId;
	//문의 제목
	private String inquiryTitle;
	//문의 내용
	private String inquiryContent;
	//작성자(이메일)
	private String email;
	//문의 생성 날짜
	private LocalDateTime inquiryCreatedAt;
	//문의 카테고리
	private Category category;
	//문의 파일
	private String inquiryImageUrl;
	//답변 생성 날짜
	private LocalDateTime answerCreatedAt;
	//답변 여부
	private boolean isAnswered;
	//답변 내용
	private String answerContent;

	@QueryProjection
	public InquiryAndAnswerDto(Long userId, Integer inquiryId, String inquiryTitle, String inquiryContent, String email,
		LocalDateTime inquiryCreatedAt, Category category, String inquiryImageUrl,
		LocalDateTime answerCreatedAt, boolean isAnswered, String answerContent) {
		this.userId = userId;
		this.inquiryId = inquiryId;
		this.inquiryTitle = inquiryTitle;
		this.inquiryContent = inquiryContent;
		this.email = email;
		this.inquiryCreatedAt = inquiryCreatedAt;
		this.category = category;
		this.inquiryImageUrl = inquiryImageUrl;
		this.answerCreatedAt = answerCreatedAt;
		this.isAnswered = isAnswered;
		this.answerContent = answerContent;
	}
}

