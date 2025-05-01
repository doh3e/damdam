package com.ssafy.damdam.domain.users.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.damdam.domain.users.entity.UserSetting;

public interface UserSettingRepository extends JpaRepository<UserSetting, Long> {
	Optional<UserSetting> findByUsers_UserId(Long userId);
}
