package com.ssafy.damdam.domain.helps.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.damdam.domain.helps.entity.Answer;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
}
