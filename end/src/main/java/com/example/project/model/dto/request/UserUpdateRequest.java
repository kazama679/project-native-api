package com.example.project.model.dto.request;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String bio;
    private String avatarUrl;
    private String website;
    private String phoneNumber;
    private String email;
    private String username;
}