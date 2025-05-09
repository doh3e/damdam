package com.ssafy.damdam.domain.users.repository;

import com.ssafy.damdam.domain.users.entity.UserSurvey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSurveyRepository extends JpaRepository<UserSurvey, Long> {

    Optional<UserSurvey> findByUsers_UserId(Long userId);

}
