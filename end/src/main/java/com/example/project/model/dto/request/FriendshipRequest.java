package com.example.project.model.dto.request;

import com.example.project.model.entity.Friendship;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FriendshipRequest {
    @NotNull(message = "Id người gửi không được để trống")
    private Integer requester;

    @NotNull(message = "Id người nhận không được để trống")
    private Integer addressee;

    private String friendshipStatus;

    public Friendship.FriendshipStatus toEnumStatus() {
        if (friendshipStatus == null || friendshipStatus.isBlank()) {
            return Friendship.FriendshipStatus.PENDING;
        }
        try {
            return Friendship.FriendshipStatus.valueOf(friendshipStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + friendshipStatus);
        }
    }
}