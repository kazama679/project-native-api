package com.example.project.service.impl;

import com.example.project.model.dto.request.LoginRequest;
import com.example.project.model.dto.request.RegisterRequest;
import com.example.project.model.dto.request.UserUpdateRequest;
import com.example.project.model.dto.response.LoginResponse;
import com.example.project.model.entity.User;
import com.example.project.repository.UserRepository;
import com.example.project.service.JwtService;
import com.example.project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .status(true)
                .build();
        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Sai mật khẩu");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername());
        return new LoginResponse(token, user.getId(), user.getUsername());
    }

    @Override
    public User getProfile(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));
    }

    @Override
    public User updateProfile(int userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));
        user.setFullName(request.getFullName());
        user.setBio(request.getBio());
        user.setAvatarUrl(request.getAvatarUrl());
        return userRepository.save(user);
    }
}