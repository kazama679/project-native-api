package com.example.project.model.dto.response;

import com.example.project.model.entity.MessageMedia;
import com.example.project.model.entity.MessageReaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Integer id;
    private UserSummary sender;
    private UserSummary receiver;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private List<MediaItem> media;
    private List<ReactionInfo> reactions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
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
        private MessageMedia.MediaType mediaType;
        private String thumbnailUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReactionInfo {
        private Integer id;
        private UserSummary user;
        private MessageReaction.ReactionType reactionType;
        private LocalDateTime createdAt;
    }
}


