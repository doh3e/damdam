package com.ssafy.damdam.domain.users.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserAuthController {

    @GetMapping("")
    public String index() {
        return "Hello World!";
    }

    @GetMapping("/logout")
    public String logout() {
        return "Logout successful";
    }
}
