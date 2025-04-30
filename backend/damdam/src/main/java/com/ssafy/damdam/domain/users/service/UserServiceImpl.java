package com.ssafy.damdam.domain.users.service;

import com.ssafy.damdam.domain.users.repository.UserInfoRepository;
import com.ssafy.damdam.domain.users.repository.UserSettingRepository;
import com.ssafy.damdam.domain.users.repository.UsersRepository;
import com.ssafy.damdam.global.util.user.UserUtil;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UsersRepository usersRepository;
    private final UserInfoRepository userInfoRepository;
    private final UserSettingRepository userSettingRepository;
    private final UserUtil userUtil;

}
