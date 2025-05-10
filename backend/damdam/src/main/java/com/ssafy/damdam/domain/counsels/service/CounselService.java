package com.ssafy.damdam.domain.counsels.service;

import java.util.List;

import com.ssafy.damdam.domain.counsels.dto.CounselingDto;

public interface CounselService {

	List<CounselingDto> getCounselList();

	Long createCounsel();

	CounselingDto getCounsel(Long id);

	void patchCounsel(Long counsId, String counsTitle);

	void deleteCounsel(Long counsId);

	void closeCounsel(Long counsId);

}
