package com.ssafy.damdam.domain.users.repository;

import com.ssafy.damdam.domain.users.entity.UserSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingRepository extends JpaRepository<UserSetting, Long> {
}
