package com.ssafy.damdam.domain.counsels.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.damdam.domain.counsels.entity.Counseling;

public interface CounselingRepository extends JpaRepository<Counseling, Long> {
	Optional<Counseling> findByUsers_UserId(Long userId);

	List<Counseling> findAllByUsers_UserIdOrderByCreatedAtDesc(Long userId);
}
