package com.example.project.service;

import com.example.project.model.dto.request.LoginRequest;
import com.example.project.model.dto.request.RegisterRequest;
import com.example.project.model.dto.request.UserUpdateRequest;
import com.example.project.model.dto.response.LoginResponse;
import com.example.project.model.entity.User;

import java.util.List;

public interface UserService {
    User register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    User getProfile(int userId);
    User updateProfile(int userId, UserUpdateRequest request);
    User searchByPhoneNumber(String phoneNumber);
    List<User> searchByUsernameOrFullName(String keyword);
}