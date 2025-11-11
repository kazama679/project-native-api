package com.example.project.model.dto.request;

import com.example.project.model.entity.MessageMedia;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private Integer receiverId;
    private String content;
    private List<MediaItem> mediaItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaItem {
        private String mediaUrl;
        private MessageMedia.MediaType mediaType;
        private String thumbnailUrl;
    }
}


