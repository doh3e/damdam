package com.ssafy.damdam.domain.helps.entity;

import com.ssafy.damdam.domain.helps.dto.NoticeInputDto;
import com.ssafy.damdam.global.audit.BaseTimeEntityWithUpdatedAt;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;

@Entity
@Getter
@ToString
@Table(name = "notice")
public class Notice extends BaseTimeEntityWithUpdatedAt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long noticeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "n_category", nullable = false, length = 20)
    private NoticeCategory category;

    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    protected Notice() {}

    public static Notice from(NoticeInputDto dto) {
        Notice n = new Notice();
        n.category = dto.getCategory();
        n.title    = dto.getTitle();
        n.content  = dto.getContent();
        return n;
    }

    public void updateNotice(NoticeInputDto noticeInputDto) {
        this.category = noticeInputDto.getCategory();
        this.title    = noticeInputDto.getTitle();
        this.content  = noticeInputDto.getContent();
    }
}
