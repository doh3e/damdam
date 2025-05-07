package com.ssafy.damdam.domain.counsels.service;

import java.util.List;

import com.ssafy.damdam.domain.counsels.dto.CounsListDto;
import com.ssafy.damdam.domain.counsels.dto.CounsOutputDto;

public interface CounselService {

	List<CounsListDto> getCounselList();

	Long createCounsel();

	CounsOutputDto getCounsel(Long id);

	void deleteCounsel(Long counsId);

	void closeCounsel(Long counsId);
}
