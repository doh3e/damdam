package com.ssafy.damdam.domain.counsels.entity;

import java.time.format.DateTimeFormatter;

import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.global.audit.BaseTimeEntityWithUpdatedAt;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name = "counseling")
public class Counseling extends BaseTimeEntityWithUpdatedAt {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "couns_id")
	private Long counsId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private Users users;

	@Column(name = "couns_title", length = 30, nullable = false)
	private String counsTitle;

	@Column(name = "is_closed", nullable = false)
	private Boolean isClosed = false;

	@Column(name = "s3_link", nullable = false)
	private String s3Link;

	protected Counseling() {
	}

	public Counseling(Users user) {
		this.users = user;
		this.isClosed = false;
		this.s3Link = "";
	}

	@PrePersist
	private void fillDefaultTitle() {
		// AuditingEntityListener가 createdAt을 먼저 채워줌
		String prefix = this.getCreatedAt().format(DateTimeFormatter.ofPattern("yyMMdd_HHmm"));
		this.counsTitle = prefix + "_상담일지";
	}

	public void updateCounsel(String counsTitle) {
		this.counsTitle = counsTitle;
	}

	public void updateS3Link(String s3Link) {
		this.s3Link = s3Link;
	}

	public void setClosed(boolean b) {
		this.isClosed = b;
	}
}
