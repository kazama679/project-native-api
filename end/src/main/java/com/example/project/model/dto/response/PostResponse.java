package com.example.project.model.dto.response;

import com.example.project.model.entity.Post;
import com.example.project.model.entity.PostMedia;
import com.example.project.model.entity.PostReaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Integer id;
    private UserInfo user;
    private String caption;
    private Post.PrivacyMode privacyMode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MediaItem> mediaItems;
    private Long reactionCount;
    private Long commentCount;
    private PostReactionInfo currentUserReaction; // Reaction của user hiện tại nếu có
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Integer id;
        private String username;
        private String fullName;
        private String avatarUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaItem {
        private Integer id;
        private String mediaUrl;
        private PostMedia.MediaType mediaType;
        private Integer orderIndex;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostReactionInfo {
        private Integer id;
        private PostReaction.ReactionType reactionType;
    }
}

