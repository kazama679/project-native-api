package com.example.project.model.dto.response;

import com.example.project.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Integer id;
    private UserInfo user;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer parentCommentId;
    private List<CommentResponse> replies; // Nested replies
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Integer id;
        private String username;
        private String fullName;
        private String avatarUrl;
    }
}

