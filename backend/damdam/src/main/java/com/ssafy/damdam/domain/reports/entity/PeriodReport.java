package com.ssafy.damdam.domain.reports.entity;

import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.global.audit.BaseTimeEntity;
import com.ssafy.damdam.global.converter.CounselListConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Entity
@Getter
@ToString
@Table(name = "period_report")
public class PeriodReport extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_report_id")
    private Long pReportId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users users;

    @Column(name = "start_date", nullable = false)
    private java.time.LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private java.time.LocalDate endDate;

    @Column(name = "counsel_time", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int counselTime;

    @Convert(converter = CounselListConverter.class)
    @Column(name = "counsel_list", length = 300, nullable = false)
    private List<Long> counselList;

    @Column(name = "summary", columnDefinition="TEXT")
    private String summary;

    @Column(name = "compliment", columnDefinition="TEXT")
    private String compliment;

    @Column(name = "worry", columnDefinition="TEXT")
    private String worry;

    @Column(name = "advice", columnDefinition="TEXT")
    private String advice;

}
