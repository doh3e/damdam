package com.ssafy.damdam.domain.helps.entity;

import com.ssafy.damdam.domain.helps.dto.AnswerInputDto;
import com.ssafy.damdam.global.audit.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name = "answer")
public class Answer extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "answer_id")
	private Long answerId;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "inquiry_id", nullable = false)
	private Inquiry inquiry;

	@Column(name = "content", columnDefinition = "TEXT", nullable = false)
	private String content;

	public static Answer createAnswer(AnswerInputDto answerInputDto, Inquiry inquiry) {
		Answer answer = new Answer();
		answer.inquiry = inquiry;
		answer.content = answerInputDto.getContent();
		return answer;
	}
}
