package com.ssafy.damdam.domain.helps.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.damdam.domain.helps.entity.Notice;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findAllByOrderByCreatedAtDesc();
}
