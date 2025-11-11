package com.example.project.service;

import com.example.project.model.dto.request.MessageReactionRequest;
import com.example.project.model.dto.request.SendMessageRequest;
import com.example.project.model.dto.response.ConversationResponse;
import com.example.project.model.dto.response.MessageMediaUploadResponse;
import com.example.project.model.dto.response.MessageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface MessageService {
    MessageResponse sendMessage(SendMessageRequest request, int senderId);
    List<MessageResponse> getConversationMessages(int currentUserId, int partnerId);
    List<ConversationResponse> getConversations(int currentUserId);
    MessageResponse reactToMessage(int messageId, int userId, MessageReactionRequest request);
    void removeReaction(int messageId, int userId);
    MessageMediaUploadResponse uploadMedia(MultipartFile file, int userId) throws IOException;
}


