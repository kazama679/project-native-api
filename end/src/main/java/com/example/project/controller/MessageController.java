package com.example.project.controller;

import com.example.project.model.dto.request.MessageReactionRequest;
import com.example.project.model.dto.request.SendMessageRequest;
import com.example.project.model.dto.response.APIResponse;
import com.example.project.model.dto.response.ConversationResponse;
import com.example.project.model.dto.response.MessageMediaUploadResponse;
import com.example.project.model.dto.response.MessageResponse;
import com.example.project.model.entity.User;
import com.example.project.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<APIResponse<MessageResponse>> sendMessage(
            @AuthenticationPrincipal User currentUser,
            @RequestBody SendMessageRequest request
    ) {
        MessageResponse message = messageService.sendMessage(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new APIResponse<>("Gửi tin nhắn thành công", message, true, 201));
    }

    @GetMapping("/threads")
    public ResponseEntity<APIResponse<List<ConversationResponse>>> getConversations(
            @AuthenticationPrincipal User currentUser
    ) {
        List<ConversationResponse> conversations = messageService.getConversations(currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>("Lấy danh sách hội thoại thành công", conversations, true, 200)
        );
    }

    @GetMapping("/threads/{partnerId}")
    public ResponseEntity<APIResponse<List<MessageResponse>>> getConversationMessages(
            @AuthenticationPrincipal User currentUser,
            @PathVariable int partnerId
    ) {
        List<MessageResponse> messages = messageService.getConversationMessages(currentUser.getId(), partnerId);
        return ResponseEntity.ok(
                new APIResponse<>("Lấy tin nhắn thành công", messages, true, 200)
        );
    }

    @PostMapping("/{messageId}/reactions")
    public ResponseEntity<APIResponse<MessageResponse>> reactToMessage(
            @AuthenticationPrincipal User currentUser,
            @PathVariable int messageId,
            @RequestBody MessageReactionRequest request
    ) {
        MessageResponse updatedMessage = messageService.reactToMessage(messageId, currentUser.getId(), request);
        return ResponseEntity.ok(
                new APIResponse<>("Reaction tin nhắn thành công", updatedMessage, true, 200)
        );
    }

    @DeleteMapping("/{messageId}/reactions")
    public ResponseEntity<APIResponse<Void>> removeReaction(
            @AuthenticationPrincipal User currentUser,
            @PathVariable int messageId
    ) {
        messageService.removeReaction(messageId, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>("Đã xóa reaction", null, true, 200)
        );
    }

    @PostMapping(value = "/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIResponse<MessageMediaUploadResponse>> uploadMedia(
            @AuthenticationPrincipal User currentUser,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        MessageMediaUploadResponse response = messageService.uploadMedia(file, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new APIResponse<>("Upload media thành công", response, true, 201));
    }
}


