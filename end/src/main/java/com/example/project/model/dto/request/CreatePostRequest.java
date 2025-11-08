package com.example.project.model.dto.request;

import com.example.project.model.entity.Post;
import com.example.project.model.entity.PostMedia;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {
    private String caption;
    private Post.PrivacyMode privacyMode;
    private List<MediaItem> mediaItems;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaItem {
        private String mediaUrl;
        private PostMedia.MediaType mediaType;
        private Integer orderIndex;
    }
}

