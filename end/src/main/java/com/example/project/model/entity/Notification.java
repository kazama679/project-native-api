package com.example.project.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "actor_id")
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Foreign key references (có thể null tùy loại thông báo)
    private Integer referenceId; // ID của post, message, friendship, etc.

    public enum NotificationType {
        FRIEND_REQUEST,         // Yêu cầu kết bạn
        FRIEND_ACCEPTED,        // Đã chấp nhận kết bạn
        NEW_MESSAGE,            // Tin nhắn mới
        POST_LIKE,              // Ai đó like bài viết
        POST_COMMENT,           // Ai đó comment bài viết
        COMMENT_REPLY           // Ai đó reply comment
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
