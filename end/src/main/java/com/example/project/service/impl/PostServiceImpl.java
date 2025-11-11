package com.example.project.service.impl;

import com.example.project.model.dto.request.CreateCommentRequest;
import com.example.project.model.dto.request.CreatePostRequest;
import com.example.project.model.dto.request.CreateReactionRequest;
import com.example.project.model.dto.request.UpdatePostPrivacyRequest;
import com.example.project.model.dto.response.CommentResponse;
import com.example.project.model.dto.response.PostResponse;
import com.example.project.model.entity.*;
import com.example.project.repository.CommentRepository;
import com.example.project.repository.FriendshipRepository;
import com.example.project.repository.PostMediaRepository;
import com.example.project.repository.PostReactionRepository;
import com.example.project.repository.PostRepository;
import com.example.project.repository.UserRepository;
import com.example.project.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostMediaRepository postMediaRepository;
    private final PostReactionRepository postReactionRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;

    @Override
    public PostResponse createPost(CreatePostRequest request, int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        Post post = Post.builder()
                .user(user)
                .caption(request.getCaption())
                .privacyMode(request.getPrivacyMode() != null ? request.getPrivacyMode() : Post.PrivacyMode.PUBLIC)
                .isDeleted(false)
                .build();

        post = postRepository.save(post);

        // Save media items
        if (request.getMediaItems() != null && !request.getMediaItems().isEmpty()) {
            List<PostMedia> mediaList = new ArrayList<>();
            for (int i = 0; i < request.getMediaItems().size(); i++) {
                CreatePostRequest.MediaItem mediaItem = request.getMediaItems().get(i);
                PostMedia media = PostMedia.builder()
                        .post(post)
                        .mediaUrl(mediaItem.getMediaUrl())
                        .mediaType(mediaItem.getMediaType())
                        .orderIndex(mediaItem.getOrderIndex() != null ? mediaItem.getOrderIndex() : i)
                        .build();
                mediaList.add(media);
            }
            postMediaRepository.saveAll(mediaList);
        }

        return convertToPostResponse(post, user);
    }

    @Override
    public List<PostResponse> getFeedPosts(int userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        List<Post> posts = postRepository.findFeedPosts(currentUser);
        return posts.stream()
                .map(post -> convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    @Override
    public List<PostResponse> getPostsByUserId(int userId, int currentUserId) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng hiện tại"));

        List<Post> posts = postRepository.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(targetUser);
        
        // Filter posts based on privacy - user can always see their own posts
        List<Post> visiblePosts = posts.stream()
                .filter(post -> canViewPost(post, currentUser))
                .collect(Collectors.toList());
        
        return visiblePosts.stream()
                .map(post -> convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    @Override
    public PostResponse getPostById(int postId, int userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết"));

        // Check privacy
        if (!canViewPost(post, currentUser)) {
            throw new IllegalStateException("Bạn không có quyền xem bài viết này");
        }

        return convertToPostResponse(post, currentUser);
    }

    @Override
    public PostResponse updatePostPrivacy(int postId, UpdatePostPrivacyRequest request, int userId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết"));

        if (post.getUser().getId() != userId) {
            throw new IllegalStateException("Bạn không có quyền cập nhật bài viết này");
        }

        post.setPrivacyMode(request.getPrivacyMode());
        post = postRepository.save(post);

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        return convertToPostResponse(post, currentUser);
    }

    @Override
    public PostReaction reactToPost(int postId, CreateReactionRequest request, int userId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        // Check if user can view this post
        if (!canViewPost(post, user)) {
            throw new IllegalStateException("Bạn không có quyền reaction bài viết này");
        }

        // Check if reaction already exists
        java.util.Optional<PostReaction> existingReaction = postReactionRepository.findByPostAndUser(post, user);
        
        if (existingReaction.isPresent()) {
            PostReaction reaction = existingReaction.get();
            // Update reaction type
            reaction.setReactionType(request.getReactionType());
            return postReactionRepository.save(reaction);
        } else {
            // Create new reaction
            PostReaction reaction = PostReaction.builder()
                    .post(post)
                    .user(user)
                    .reactionType(request.getReactionType())
                    .build();
            return postReactionRepository.save(reaction);
        }
    }

    @Override
    public void removeReaction(int postId, int userId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        PostReaction reaction = postReactionRepository.findByPostAndUser(post, user)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy reaction"));

        postReactionRepository.delete(reaction);
    }

    @Override
    public CommentResponse createComment(int postId, CreateCommentRequest request, int userId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        // Check if user can view this post
        if (!canViewPost(post, user)) {
            throw new IllegalStateException("Bạn không có quyền bình luận bài viết này");
        }

        Comment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bình luận cha"));
        }

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .parentComment(parentComment)
                .isDeleted(false)
                .build();

        comment = commentRepository.save(comment);
        return convertToCommentResponse(comment);
    }

    @Override
    public List<CommentResponse> getCommentsByPostId(int postId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết"));

        List<Comment> topLevelComments = commentRepository.findByPostAndIsDeletedFalseAndParentCommentIsNullOrderByCreatedAtDesc(post);
        
        return topLevelComments.stream()
                .map(this::convertToCommentResponseWithReplies)
                .collect(Collectors.toList());
    }

    @Override
    public void deletePost(int postId, int userId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết"));

        // Kiểm tra quyền: chỉ chủ bài viết mới được xóa
        if (post.getUser().getId() != userId) {
            throw new IllegalStateException("Bạn không có quyền xóa bài viết này");
        }

        // Soft delete: đánh dấu isDeleted = true
        post.setIsDeleted(true);
        postRepository.save(post);
    }

    private boolean canViewPost(Post post, User currentUser) {
        // User can always view their own posts
        if (post.getUser().getId()==(currentUser.getId())) {
            return true;
        }

        // Check privacy mode
        switch (post.getPrivacyMode()) {
            case PUBLIC:
                return true;
            case FRIENDS:
                // Check if currentUser is a friend of post owner
                return areFriends(post.getUser(), currentUser);
            case PRIVATE:
                return false;
            default:
                return false;
        }
    }

    private boolean areFriends(User user1, User user2) {
        if (user1.getId()==(user2.getId())) {
            return true;
        }
        return friendshipRepository.findAcceptedBetween(user1, user2).isPresent();
    }

    private PostResponse convertToPostResponse(Post post, User currentUser) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setCaption(post.getCaption());
        response.setPrivacyMode(post.getPrivacyMode());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());

        // Set user info
        PostResponse.UserInfo userInfo = new PostResponse.UserInfo();
        userInfo.setId(post.getUser().getId());
        userInfo.setUsername(post.getUser().getUsername());
        userInfo.setFullName(post.getUser().getFullName());
        userInfo.setAvatarUrl(post.getUser().getAvatarUrl());
        response.setUser(userInfo);

        // Set media items
        List<PostMedia> mediaList = postMediaRepository.findByPostOrderByOrderIndexAsc(post);
        List<PostResponse.MediaItem> mediaItems = mediaList.stream()
                .map(media -> {
                    PostResponse.MediaItem item = new PostResponse.MediaItem();
                    item.setId(media.getId());
                    item.setMediaUrl(media.getMediaUrl());
                    item.setMediaType(media.getMediaType());
                    item.setOrderIndex(media.getOrderIndex());
                    return item;
                })
                .collect(Collectors.toList());
        response.setMediaItems(mediaItems);

        // Set reaction count
        long reactionCount = postReactionRepository.countByPost(post);
        response.setReactionCount(reactionCount);

        // Set comment count
        long commentCount = commentRepository.countByPost(post);
        response.setCommentCount(commentCount);

        // Set current user reaction if exists
        java.util.Optional<PostReaction> userReaction = postReactionRepository.findByPostAndUser(post, currentUser);
        if (userReaction.isPresent()) {
            PostResponse.PostReactionInfo reactionInfo = new PostResponse.PostReactionInfo();
            reactionInfo.setId(userReaction.get().getId());
            reactionInfo.setReactionType(userReaction.get().getReactionType());
            response.setCurrentUserReaction(reactionInfo);
        }

        return response;
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        response.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);

        CommentResponse.UserInfo userInfo = new CommentResponse.UserInfo();
        userInfo.setId(comment.getUser().getId());
        userInfo.setUsername(comment.getUser().getUsername());
        userInfo.setFullName(comment.getUser().getFullName());
        userInfo.setAvatarUrl(comment.getUser().getAvatarUrl());
        response.setUser(userInfo);

        return response;
    }

    private CommentResponse convertToCommentResponseWithReplies(Comment comment) {
        CommentResponse response = convertToCommentResponse(comment);
        
        // Get replies
        List<Comment> replies = commentRepository.findByParentCommentAndIsDeletedFalseOrderByCreatedAtAsc(comment);
        List<CommentResponse> replyResponses = replies.stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList());
        response.setReplies(replyResponses);

        return response;
    }
}

