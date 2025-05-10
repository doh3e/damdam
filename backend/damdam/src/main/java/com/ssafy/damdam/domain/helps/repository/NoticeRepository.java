package com.ssafy.damdam.domain.helps.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.damdam.domain.helps.entity.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
}
