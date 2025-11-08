package com.example.project.model.dto.request;

import com.example.project.model.entity.PostReaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReactionRequest {
    private PostReaction.ReactionType reactionType;
}

