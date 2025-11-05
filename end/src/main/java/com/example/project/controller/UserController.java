package com.example.project.controller;

import com.example.project.model.dto.request.LoginRequest;
import com.example.project.model.dto.request.RegisterRequest;
import com.example.project.model.dto.request.UserUpdateRequest;
import com.example.project.model.dto.response.APIResponse;
import com.example.project.model.dto.response.LoginResponse;
import com.example.project.model.entity.User;
import com.example.project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<APIResponse<User>> register(@RequestBody RegisterRequest request) {
        User newUser = userService.register(request);
        return ResponseEntity.status(201).body(
                new APIResponse<>("Đăng ký tài khoản thành công", newUser, true, 201)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<APIResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(
                new APIResponse<>("Đăng nhập thành công", response, true, 200)
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<APIResponse<User>> getProfile(@PathVariable int userId) {
        User user = userService.getProfile(userId);
        return ResponseEntity.ok(
                new APIResponse<>("Lấy thông tin tài khoản thành công", user, true, 200)
        );
    }

    @PutMapping("/{userId}")
    public ResponseEntity<APIResponse<User>> updateProfile(
            @PathVariable int userId,
            @RequestBody UserUpdateRequest request
    ) {
        User updated = userService.updateProfile(userId, request);
        return ResponseEntity.ok(
                new APIResponse<>("Cập nhật thông tin cá nhân thành công", updated, true, 200)
        );
    }
}