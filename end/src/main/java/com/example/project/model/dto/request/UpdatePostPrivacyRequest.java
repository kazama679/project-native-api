package com.example.project.model.dto.request;

import com.example.project.model.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePostPrivacyRequest {
    private Post.PrivacyMode privacyMode;
}

