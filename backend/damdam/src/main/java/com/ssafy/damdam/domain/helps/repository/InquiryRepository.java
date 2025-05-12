package com.ssafy.damdam.domain.helps.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.damdam.domain.helps.entity.Inquiry;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
}
