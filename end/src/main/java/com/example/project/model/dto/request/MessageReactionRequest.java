package com.example.project.model.dto.request;

import com.example.project.model.entity.MessageReaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageReactionRequest {
    private MessageReaction.ReactionType reactionType;
}


