package com.example.project.model.dto.response;

import com.example.project.model.entity.PostReaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostReactionResponse {
    private Integer id;
    private UserInfo user;
    private PostReaction.ReactionType reactionType;
    private java.time.LocalDateTime createdAt;
    
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

