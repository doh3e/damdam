package com.ssafy.damdam.domain.reports.entity;

import com.ssafy.damdam.domain.counsels.entity.Counseling;
import com.ssafy.damdam.domain.counsels.entity.Feeling;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name = "session_report")
public class SessionReport extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "s_report_id")
	private Long sReportId;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "couns_id", nullable = false)
	private Counseling counseling;

	@Column(name = "summary", columnDefinition = "TEXT")
	private String summary;

	@Column(name = "analyse", columnDefinition = "TEXT")
	private String analyse;

	@Enumerated(EnumType.STRING)
	@Column(name = "feeling", nullable = false, length = 20)
	private Feeling feeling;

}
