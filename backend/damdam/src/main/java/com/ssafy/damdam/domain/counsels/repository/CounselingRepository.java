package com.ssafy.damdam.domain.counsels.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.damdam.domain.counsels.entity.Counseling;

public interface CounselingRepository extends JpaRepository<Counseling, Long> {
}
