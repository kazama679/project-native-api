package com.example.project.controller;

import com.example.project.model.dto.request.FriendshipRequest;
import com.example.project.model.dto.response.APIResponse;
import com.example.project.model.entity.Friendship;
import com.example.project.service.FriendshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

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

    @GetMapping("/incoming")
    public ResponseEntity<APIResponse<List<Friendship>>> getIncomingRequests(
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        List<Friendship> incoming = friendshipService.getIncomingRequestsForUser(currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Lấy danh sách lời mời kết bạn thành công",
                        incoming,
                        true,
                        200
                )
        );
    }

    @PutMapping("/{friendshipId}/accept")
    public ResponseEntity<APIResponse<Friendship>> acceptFriendship(
            @PathVariable int friendshipId,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        Friendship updated = friendshipService.acceptFriendship(friendshipId, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Chấp nhận lời mời kết bạn thành công",
                        updated,
                        true,
                        200
                )
        );
    }

    @PostMapping("/follow/{targetUserId}")
    public ResponseEntity<APIResponse<Friendship>> followUser(
            @PathVariable int targetUserId,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        Friendship created = friendshipService.followUser(targetUserId, currentUser.getId());
        return ResponseEntity.status(201).body(
                new APIResponse<>(
                        "Theo dõi thành công",
                        created,
                        true,
                        201
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

    @PostMapping("/send-request/{targetUserId}")
    public ResponseEntity<APIResponse<Friendship>> sendFriendRequest(
            @PathVariable int targetUserId,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        Friendship friendship = friendshipService.sendFriendRequest(targetUserId, currentUser.getId());
        return ResponseEntity.status(201).body(
                new APIResponse<>(
                        "Gửi lời mời kết bạn thành công",
                        friendship,
                        true,
                        201
                )
        );
    }

    @GetMapping("/outgoing")
    public ResponseEntity<APIResponse<List<Friendship>>> getOutgoingRequests(
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        List<Friendship> outgoing = friendshipService.getOutgoingRequestsForUser(currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Lấy danh sách lời mời đã gửi thành công",
                        outgoing,
                        true,
                        200
                )
        );
    }

    @DeleteMapping("/cancel/{friendshipId}")
    public ResponseEntity<APIResponse<String>> cancelFriendRequest(
            @PathVariable int friendshipId,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        friendshipService.cancelFriendRequest(friendshipId, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Hủy lời mời kết bạn thành công",
                        "Lời mời với ID " + friendshipId + " đã được hủy",
                        true,
                        200
                )
        );
    }

    @DeleteMapping("/unfriend/{targetUserId}")
    public ResponseEntity<APIResponse<String>> unfriend(
            @PathVariable int targetUserId,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        friendshipService.unfriend(targetUserId, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Hủy kết bạn thành công",
                        "Đã hủy kết bạn với người dùng ID " + targetUserId,
                        true,
                        200
                )
        );
    }

    @GetMapping("/friends")
    public ResponseEntity<APIResponse<List<Friendship>>> getFriendsList(
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        List<Friendship> friends = friendshipService.getFriendsList(currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Lấy danh sách bạn bè thành công",
                        friends,
                        true,
                        200
                )
        );
    }

    @PostMapping("/block/{targetUserId}")
    public ResponseEntity<APIResponse<String>> blockFriend(
            @PathVariable int targetUserId,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        friendshipService.blockFriend(targetUserId, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Chặn bạn bè thành công",
                        "Đã chặn người dùng ID " + targetUserId,
                        true,
                        200
                )
        );
    }

    @GetMapping("/followers")
    public ResponseEntity<APIResponse<java.util.List<com.example.project.model.entity.User>>> getFollowers(
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        java.util.List<com.example.project.model.entity.User> followers = friendshipService.getFollowers(currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Lấy danh sách người theo dõi thành công",
                        followers,
                        true,
                        200
                )
        );
    }

    @GetMapping("/following")
    public ResponseEntity<APIResponse<java.util.List<com.example.project.model.entity.User>>> getFollowing(
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        java.util.List<com.example.project.model.entity.User> following = friendshipService.getFollowing(currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>(
                        "Lấy danh sách đang theo dõi thành công",
                        following,
                        true,
                        200
                )
        );
    }
}
