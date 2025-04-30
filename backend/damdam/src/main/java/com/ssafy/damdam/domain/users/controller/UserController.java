package com.ssafy.damdam.domain.users.controller;

import com.ssafy.damdam.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
//@RequestMapping("/api/v1/damdam/users")
public class UserController {

    private final UserService userService;
}
