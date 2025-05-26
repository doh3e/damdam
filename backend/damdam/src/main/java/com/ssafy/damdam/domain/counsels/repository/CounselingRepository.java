package com.ssafy.damdam.domain.counsels.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ssafy.damdam.domain.counsels.entity.Counseling;

public interface CounselingRepository extends JpaRepository<Counseling, Long> {
	Optional<Counseling> findByUsers_UserId(Long userId);

	List<Counseling> findAllByUsers_UserIdOrderByCreatedAtDesc(Long userId);

	@Query("""
		SELECT COUNT(c)
		FROM Counseling c
		WHERE c.users.userId       = :userId
		  AND c.createdAt BETWEEN :start AND :end
		  AND c.s3Link    IS NOT NULL
		  AND TRIM(c.s3Link) <> ''
		""")
	long countValidCounselings(
		@Param("userId") Long userId,
		@Param("start") LocalDateTime start,
		@Param("end") LocalDateTime end
	);
}
