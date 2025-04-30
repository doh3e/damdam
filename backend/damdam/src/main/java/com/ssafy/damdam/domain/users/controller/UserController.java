package com.ssafy.damdam.domain.users.controller;

import com.ssafy.damdam.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
//@RequestMapping("/api/v1/damdam/users")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<String> getProfile() {
        userService.getUserProfile();
        return ResponseEntity.ok().body("탈퇴 요청이 완료되었습니다.");
    }

    @PatchMapping
    public ResponseEntity<String> patchProfile() {
        userService.editUserProfile();
        return ResponseEntity.ok().body("탈퇴 요청이 완료되었습니다.");
    }

    @GetMapping
    public ResponseEntity<String> getSetting() {
        userService.getUserSetting();
        return ResponseEntity.ok().body("탈퇴 요청이 완료되었습니다.");
    }

    @PatchMapping
    public ResponseEntity<String> patchSetting() {
        userService.editUserSetting();
        return ResponseEntity.ok().body("탈퇴 요청이 완료되었습니다.");
    }



}
