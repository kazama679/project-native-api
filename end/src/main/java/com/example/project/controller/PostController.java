package com.example.project.controller;

import com.example.project.model.dto.request.CreateCommentRequest;
import com.example.project.model.dto.request.CreatePostRequest;
import com.example.project.model.dto.request.CreateReactionRequest;
import com.example.project.model.dto.request.UpdatePostPrivacyRequest;
import com.example.project.model.dto.response.APIResponse;
import com.example.project.model.dto.response.CommentResponse;
import com.example.project.model.dto.response.PostResponse;
import com.example.project.model.entity.PostReaction;
import com.example.project.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // Đăng bài viết
    @PostMapping
    public ResponseEntity<APIResponse<PostResponse>> createPost(
            @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        PostResponse post = postService.createPost(request, currentUser.getId());
        return ResponseEntity.status(201).body(
                new APIResponse<>("Đăng bài viết thành công", post, true, 201)
        );
    }

    // Xem bài viết của bạn bè (newsfeed)
    @GetMapping("/feed")
    public ResponseEntity<APIResponse<List<PostResponse>>> getFeedPosts(
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        List<PostResponse> posts = postService.getFeedPosts(currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>("Lấy danh sách bài viết thành công", posts, true, 200)
        );
    }

    // Lấy danh sách bài viết của user
    @GetMapping("/user/{userId}")
    public ResponseEntity<APIResponse<List<PostResponse>>> getPostsByUserId(
            @PathVariable int userId,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        List<PostResponse> posts = postService.getPostsByUserId(userId, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>("Lấy danh sách bài viết thành công", posts, true, 200)
        );
    }

    // Xem chi tiết bài viết
    @GetMapping("/{postId}")
    public ResponseEntity<APIResponse<PostResponse>> getPostById(
            @PathVariable int postId,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        PostResponse post = postService.getPostById(postId, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>("Lấy thông tin bài viết thành công", post, true, 200)
        );
    }

    // Cập nhật chế độ xem bài viết
    @PutMapping("/{postId}/privacy")
    public ResponseEntity<APIResponse<PostResponse>> updatePostPrivacy(
            @PathVariable int postId,
            @RequestBody UpdatePostPrivacyRequest request,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        PostResponse post = postService.updatePostPrivacy(postId, request, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>("Cập nhật chế độ xem bài viết thành công", post, true, 200)
        );
    }

    // Reaction bài viết
    @PostMapping("/{postId}/reactions")
    public ResponseEntity<APIResponse<PostReaction>> reactToPost(
            @PathVariable int postId,
            @RequestBody CreateReactionRequest request,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        PostReaction reaction = postService.reactToPost(postId, request, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>("Reaction bài viết thành công", reaction, true, 200)
        );
    }

    // Xóa reaction bài viết
    @DeleteMapping("/{postId}/reactions")
    public ResponseEntity<APIResponse<String>> removeReaction(
            @PathVariable int postId,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        postService.removeReaction(postId, currentUser.getId());
        return ResponseEntity.ok(
                new APIResponse<>("Xóa reaction thành công", "Đã xóa reaction", true, 200)
        );
    }

    // Bình luận bài viết
    @PostMapping("/{postId}/comments")
    public ResponseEntity<APIResponse<CommentResponse>> createComment(
            @PathVariable int postId,
            @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal com.example.project.model.entity.User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new APIResponse<>(
                    "Chưa đăng nhập",
                    null,
                    false,
                    401
            ));
        }
        CommentResponse comment = postService.createComment(postId, request, currentUser.getId());
        return ResponseEntity.status(201).body(
                new APIResponse<>("Bình luận thành công", comment, true, 201)
        );
    }

    // Hiển thị danh sách bình luận của bài viết
    @GetMapping("/{postId}/comments")
    public ResponseEntity<APIResponse<List<CommentResponse>>> getCommentsByPostId(
            @PathVariable int postId) {
        List<CommentResponse> comments = postService.getCommentsByPostId(postId);
        return ResponseEntity.ok(
                new APIResponse<>("Lấy danh sách bình luận thành công", comments, true, 200)
        );
    }
}

