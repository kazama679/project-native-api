package com.example.project.model.dto.response;

import com.example.project.model.entity.MessageMedia;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageMediaUploadResponse {
    private String mediaUrl;
    private MessageMedia.MediaType mediaType;
    private String thumbnailUrl;
}


