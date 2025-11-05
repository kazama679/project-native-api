package com.example.project.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "message_reactions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"message_id", "user_id"})
})
public class MessageReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReactionType reactionType;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum ReactionType {
        LIKE,       // 👍
        LOVE,       // ❤️
        HAHA,       // 😂
        WOW,        // 😮
        SAD,        // 😢
        ANGRY       // 😠
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
