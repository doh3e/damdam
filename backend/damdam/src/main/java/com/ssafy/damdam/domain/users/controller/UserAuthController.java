package com.ssafy.damdam.domain.users.controller;

import com.ssafy.damdam.domain.users.service.CustomOAuth2UserService;
import com.ssafy.damdam.domain.users.service.UserAuthServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
//@RequestMapping("/api/v1/damdam/users")
public class UserAuthController {

    private final UserAuthServiceImpl userAuthServiceImpl;
    private final CustomOAuth2UserService customOAuth2UserService;

    @GetMapping("")
    public ResponseEntity<String> index() {
        return ResponseEntity.ok().body("index");
    }

    @DeleteMapping("/leaving")
    public ResponseEntity<String> leaving() {
        userAuthServiceImpl.deleteUser();
        return ResponseEntity.ok().body("탈퇴 요청이 완료되었습니다.");
    }
}
