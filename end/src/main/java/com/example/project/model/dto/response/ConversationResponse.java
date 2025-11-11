package com.example.project.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private ParticipantInfo participant;
    private MessageResponse lastMessage;
    private long unreadCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private Integer id;
        private String username;
        private String fullName;
        private String avatarUrl;
    }
}


