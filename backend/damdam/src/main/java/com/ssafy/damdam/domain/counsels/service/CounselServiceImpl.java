package com.ssafy.damdam.domain.counsels.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.counsels.dto.CounsListDto;
import com.ssafy.damdam.domain.counsels.dto.CounsOutputDto;
import com.ssafy.damdam.domain.counsels.repository.CounselingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CounselServiceImpl implements CounselService {

	private final CounselingRepository counselingRepository;

	@Override
	public CounsListDto getCounselList() {
		return null;
	}

	@Override
	public Long createCounsel() {
		return 0L;
	}

	@Override
	public CounsOutputDto getCounsel(Long id) {
		return null;
	}
}
