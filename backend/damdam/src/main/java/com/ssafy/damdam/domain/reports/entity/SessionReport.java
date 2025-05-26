package com.ssafy.damdam.domain.reports.entity;

import java.time.format.DateTimeFormatter;

import com.ssafy.damdam.domain.counsels.entity.Counseling;
import com.ssafy.damdam.global.audit.BaseTimeEntity;

import com.ssafy.damdam.global.converter.AESConverter;
import jakarta.persistence.*;
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

	@Column(name = "s_report_title", length = 30, nullable = false)
	private String sReportTitle;

	@Convert(converter = AESConverter.class)
	@Column(name = "summary", columnDefinition = "TEXT")
	private String summary;

	@Convert(converter = AESConverter.class)
	@Column(name = "analyze", columnDefinition = "TEXT")
	private String analyze;

	@Column(name = "valence", length = 10)
	private String valence;

	@Column(name = "arousal", length = 10)
	private String arousal;

	@PrePersist
	private void fillDefaultTitle() {
		String prefix = this.getCounseling().getUpdatedAt().format(DateTimeFormatter.ofPattern("yyMMdd_HHmm"));
		this.sReportTitle = prefix + "_상담레포트";
	}

	public void updateSReport(String sReportTitle) {
		this.sReportTitle = sReportTitle;
	}

	public static SessionReport of(
		Counseling counseling,
		String summary,
		String analyze,
		String arousal,
		String valence
	) {
		SessionReport r = new SessionReport();
		r.counseling = counseling;
		r.summary = summary;
		r.analyze = analyze;
		r.arousal = arousal;
		r.valence = valence;
		r.fillDefaultTitle();
		return r;
	}

}
