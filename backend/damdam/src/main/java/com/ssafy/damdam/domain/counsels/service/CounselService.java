package com.ssafy.damdam.domain.counsels.service;

import com.ssafy.damdam.domain.counsels.dto.CounsListDto;
import com.ssafy.damdam.domain.counsels.dto.CounsOutputDto;

public interface CounselService {

	CounsListDto getCounselList();

	Long createCounsel();

	CounsOutputDto getCounsel(Long id);
}
