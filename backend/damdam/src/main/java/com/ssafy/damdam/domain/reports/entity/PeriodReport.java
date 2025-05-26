package com.ssafy.damdam.domain.reports.entity;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.ssafy.damdam.domain.reports.dto.LlmPeriodReportResponse;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.global.audit.BaseTimeEntity;
import com.ssafy.damdam.global.converter.AESConverter;
import com.ssafy.damdam.global.converter.CounselListConverter;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name = "period_report")
public class PeriodReport extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "p_report_id")
	private Long pReportId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private Users users;

	@Column(name = "p_report_title", length = 30, nullable = false)
	private String pReportTitle;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;

	@Column(name = "counsel_time", nullable = false, columnDefinition = "INT DEFAULT 0")
	private int counselTime;

	@Convert(converter = CounselListConverter.class)
	@Column(name = "counsel_list", length = 300, nullable = false)
	private List<Long> counselList;

	@Convert(converter = AESConverter.class)
	@Column(name = "summary", columnDefinition = "TEXT")
	private String summary;

	@Convert(converter = AESConverter.class)
	@Column(name = "compliment", columnDefinition = "TEXT")
	private String compliment;

	@Convert(converter = AESConverter.class)
	@Column(name = "worry", columnDefinition = "TEXT")
	private String worry;

	@Convert(converter = AESConverter.class)
	@Column(name = "advice", columnDefinition = "TEXT")
	private String advice;

	public void updatePReport(String pReportTitle) {
		this.pReportTitle = pReportTitle;
	}

	public void createPeriodReport(
		Users users,
		LocalDate startDate,
		LocalDate endDate,
		int counselTime,
		List<Long> counselList,
		LlmPeriodReportResponse response
	) {
		this.users = users;
		this.startDate = startDate;
		this.endDate = endDate;
		this.counselTime = counselTime;
		this.counselList = counselList;
		this.summary = response.getSummary();
		this.compliment = response.getCompliment();
		this.worry = response.getWorry();
		this.advice = response.getAdvice();
		this.pReportTitle = startDate.format(DateTimeFormatter.ofPattern("yy-MM-dd"))
			+ " ~ "
			+ endDate.format(DateTimeFormatter.ofPattern("yy-MM-dd"))
			+ " 기간별 레포트";
	}

}
