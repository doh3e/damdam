package com.ssafy.damdam.domain.helps.entity;

import com.ssafy.damdam.domain.helps.dto.InquiryInputDto;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.global.audit.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Getter
@Table(name = "inquiry")
public class Inquiry extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "inquiry_id")
	private Long inquiryId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private Users users;

	@Column(name = "email", length = 100, nullable = false)
	private String email;

	@Column(name = "title", nullable = false)
	private String title;

	@Enumerated(EnumType.STRING)
	@Column(name = "category", nullable = false, length = 20)
	private InquiryCategory inquiryCategory;

	@Column(name = "content", columnDefinition = "TEXT", nullable = false)
	private String content;

	@Column(name = "file")
	private String file;

	@Column(name = "is_answered", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
	private Boolean isAnswered = false;

	public static Inquiry createInquiry(Users user, InquiryInputDto inquiryInputDto, String file) {
		Inquiry inquiry = new Inquiry();
		inquiry.users = user;
		inquiry.email = inquiryInputDto.getEmail();
		inquiry.title = inquiryInputDto.getTitle();
		inquiry.inquiryCategory = InquiryCategory.valueOf(inquiryInputDto.getCategory());
		inquiry.content = inquiryInputDto.getContent();
		inquiry.file = file;
		inquiry.isAnswered = false;

		return inquiry;
	}

	public void isAnswered() {
		this.isAnswered = true;
	}
}
