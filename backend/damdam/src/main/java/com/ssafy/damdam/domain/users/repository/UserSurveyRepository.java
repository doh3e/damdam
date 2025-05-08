package com.ssafy.damdam.domain.users.repository;

import com.ssafy.damdam.domain.users.entity.UserSurvey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSurveyRepository extends JpaRepository<UserSurvey, Long> {
}
