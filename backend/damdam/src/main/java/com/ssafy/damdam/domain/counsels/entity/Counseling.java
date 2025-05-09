package com.ssafy.damdam.domain.counsels.entity;

import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.global.audit.BaseTimeEntityWithUpdatedAt;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;

import java.time.format.DateTimeFormatter;

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

	protected Counseling() {
	}

	public Counseling(Users user) {
		this.users = user;
		this.isClosed = false;
	}

	@PrePersist
	private void fillDefaultTitle() {
		// AuditingEntityListener가 createdAt을 먼저 채워줌
		String prefix = this.getCreatedAt().toLocalDate()
				.format(DateTimeFormatter.ofPattern("yyMMdd"));
		this.counsTitle = prefix + "_상담일지";
	}

}
