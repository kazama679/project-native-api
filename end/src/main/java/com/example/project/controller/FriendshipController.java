package com.example.project.controller;

import com.example.project.model.dto.request.FriendshipRequest;
import com.example.project.model.dto.response.APIResponse;
import com.example.project.model.entity.Friendship;
import com.example.project.service.FriendshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friendships")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @GetMapping
    public ResponseEntity<APIResponse<List<Friendship>>> getAllFriendships() {
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Lấy danh sách mối quan hệ bạn bè thành công",
                        friendshipService.getAllFreFriendships(),
                        true,
                        200
                )
        );
    }

    @PostMapping
    public ResponseEntity<APIResponse<Friendship>> createFriendship(
            @Valid @RequestBody FriendshipRequest request) {

        Friendship newFriendship = friendshipService.add(request);
        return ResponseEntity.status(201).body(
                new APIResponse<>(
                        "Gửi lời mời kết bạn thành công",
                        newFriendship,
                        true,
                        201
                )
        );
    }

    @PutMapping("/{friendshipId}")
    public ResponseEntity<APIResponse<Friendship>> updateFriendship(
            @Valid @RequestBody FriendshipRequest request,
            @PathVariable int friendshipId) {

        Friendship updatedFriendship = friendshipService.update(request, friendshipId);
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Cập nhật trạng thái mối quan hệ thành công",
                        updatedFriendship,
                        true,
                        200
                )
        );
    }

    @DeleteMapping("/{friendshipId}")
    public ResponseEntity<APIResponse<String>> deleteFriendship(@PathVariable int friendshipId) {
        friendshipService.delete(friendshipId);
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Xóa mối quan hệ thành công",
                        "Mối quan hệ với ID " + friendshipId + " đã được xóa",
                        true,
                        200
                )
        );
    }
}
