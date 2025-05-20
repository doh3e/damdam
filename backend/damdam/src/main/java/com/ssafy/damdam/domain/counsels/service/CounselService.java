package com.ssafy.damdam.domain.counsels.service;

import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.ssafy.damdam.domain.counsels.dto.CounselingChatListDto;
import com.ssafy.damdam.domain.counsels.dto.CounselingDto;

public interface CounselService {

	List<CounselingDto> getCounselList();

	Long createCounsel();

	CounselingChatListDto getCounsel(Long counsId);

	void patchCounsel(Long counsId, String counsTitle);

	void deleteCounsel(Long counsId);

	void closeCounsel(Long counsId);

	Long reportCounsel(Long counsId) throws JsonProcessingException;
}
