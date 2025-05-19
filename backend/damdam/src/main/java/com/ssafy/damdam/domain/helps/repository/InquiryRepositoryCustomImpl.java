package com.ssafy.damdam.domain.helps.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.damdam.domain.helps.dto.InquiryAndAnswerDto;
import com.ssafy.damdam.domain.helps.dto.QInquiryAndAnswerDto;
import com.ssafy.damdam.domain.helps.entity.QAnswer;
import com.ssafy.damdam.domain.helps.entity.QInquiry;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class InquiryRepositoryCustomImpl implements InquiryRepositoryCustom {

	private final JPAQueryFactory queryFactory;
	private final QInquiry inquiry = QInquiry.inquiry;
	private final QAnswer answer = QAnswer.answer;

	@Override
	public List<InquiryAndAnswerDto> findAllInquiry() {
		return queryFactory
			.select(new QInquiryAndAnswerDto(
				inquiry.users.userId,
				inquiry.inquiryId.intValue(),
				inquiry.title,
				inquiry.content,
				inquiry.email,
				inquiry.createdAt,
				inquiry.category,
				inquiry.file,
				answer.createdAt,
				inquiry.isAnswered,
				answer.content
			))
			.from(inquiry)
			.leftJoin(answer).on(answer.inquiry.eq(inquiry))
			.orderBy(inquiry.createdAt.desc())
			.fetch();
	}

	@Override
	public List<InquiryAndAnswerDto> findByUsersUserId(Long userId) {
		BooleanBuilder builder = new BooleanBuilder();
		if (userId != null) {
			builder.and(inquiry.users.userId.eq(userId));
		}

		return queryFactory
			.select(new QInquiryAndAnswerDto(
				inquiry.users.userId,
				inquiry.inquiryId.intValue(),
				inquiry.title,
				inquiry.content,
				inquiry.email,
				inquiry.createdAt,
				inquiry.category,
				inquiry.file,
				answer.createdAt,
				inquiry.isAnswered,
				answer.content
			))
			.from(inquiry)
			.leftJoin(answer).on(answer.inquiry.eq(inquiry))
			.where(builder)
			.orderBy(inquiry.createdAt.desc())
			.fetch();
	}
}
