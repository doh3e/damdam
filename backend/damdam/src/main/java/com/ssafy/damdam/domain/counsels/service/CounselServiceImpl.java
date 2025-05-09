package com.ssafy.damdam.domain.counsels.service;

import static com.ssafy.damdam.domain.counsels.exception.CounsExceptionCode.*;
import static com.ssafy.damdam.domain.users.exception.auth.AuthExceptionCode.*;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.damdam.domain.counsels.dto.CounsListDto;
import com.ssafy.damdam.domain.counsels.dto.CounsOutputDto;
import com.ssafy.damdam.domain.counsels.entity.Counseling;
import com.ssafy.damdam.domain.counsels.exception.CounsException;
import com.ssafy.damdam.domain.counsels.repository.CounselingRepository;
import com.ssafy.damdam.domain.users.entity.Users;
import com.ssafy.damdam.domain.users.exception.auth.AuthException;
import com.ssafy.damdam.global.util.user.UserUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CounselServiceImpl implements CounselService {

	private final CounselingRepository counselingRepository;
	private final UserUtil userUtil;

	// 유저 검증 메서드
	private Users validateUser() {
		Users user = userUtil.getUser();
		if (user == null) {
			throw new AuthException(AUTH_MEMBER_NOT_FOUND);
		}
		return user;
	}

	@Override
	public List<CounsListDto> getCounselList() {

		Users user = validateUser();
		List<Counseling> counsList =
			counselingRepository.findAllByUsers_UserIdOrderByCreatedAtDesc(user.getUserId());

		return counsList.stream()
			.map(c -> CounsListDto.builder()
				.counsId(c.getCounsId())
				.counsTitle(c.getCounsTitle())
				.createdAt(c.getCreatedAt())
				.updatedAt(c.getUpdatedAt())
				.isClosed(c.getIsClosed())
				.build())
			.toList();
	}

	@Override
	@Transactional
	public Long createCounsel() {
		Users user = validateUser();
		Counseling saved = counselingRepository.save(new Counseling(user));

		return saved.getCounsId();
	}

	@Override
	public CounsOutputDto getCounsel(Long id){
		Users user = validateUser();
		Counseling counseling = counselingRepository.findById(id)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		if (!counseling.getUsers().getUserId().equals(user.getUserId())) {
			throw new CounsException(NOT_YOUR_COUNSEL);
		}

		return CounsOutputDto.fromEntity(counseling);
	}

	@Override
	@Transactional
	public void patchCounsel(Long counsId, String counsTitle) {

		Users user = validateUser();
		Counseling counseling = counselingRepository.findById(counsId)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		if (!counseling.getUsers().getUserId().equals(user.getUserId())) {
			throw new CounsException(NOT_YOUR_COUNSEL);
		}

		counseling.updateCounsel(counsTitle);
	}

	@Override
	@Transactional
	public void deleteCounsel(Long counsId) {
		Users user = validateUser();
		Counseling counseling = counselingRepository.findById(counsId)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		if (!counseling.getUsers().getUserId().equals(user.getUserId())) {
			throw new CounsException(NOT_YOUR_COUNSEL);
		}

		counselingRepository.delete(counseling);
	}

	@Override
	@Transactional
	public void closeCounsel(Long counsId) {
		Users user = validateUser();
		Counseling counseling = counselingRepository.findById(counsId)
			.orElseThrow(() -> new CounsException(COUNSEL_NOT_FOUND));

		if (!counseling.getUsers().getUserId().equals(user.getUserId())) {
			throw new CounsException(NOT_YOUR_COUNSEL);
		}

		counseling.updateCounsel(counseling.getCounsTitle());
		counseling.setClosed(true);

	}
}
