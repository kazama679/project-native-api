package com.example.project.service;

import com.example.project.model.dto.request.CreateCommentRequest;
import com.example.project.model.dto.request.CreatePostRequest;
import com.example.project.model.dto.request.CreateReactionRequest;
import com.example.project.model.dto.request.UpdatePostPrivacyRequest;
import com.example.project.model.dto.response.CommentResponse;
import com.example.project.model.dto.response.PostResponse;
import com.example.project.model.entity.Post;
import com.example.project.model.entity.PostReaction;

import java.util.List;

public interface PostService {
    PostResponse createPost(CreatePostRequest request, int userId);
    List<PostResponse> getFeedPosts(int userId);
    List<PostResponse> getPostsByUserId(int userId, int currentUserId);
    PostResponse getPostById(int postId, int userId);
    PostResponse updatePostPrivacy(int postId, UpdatePostPrivacyRequest request, int userId);
    PostReaction reactToPost(int postId, CreateReactionRequest request, int userId);
    void removeReaction(int postId, int userId);
    CommentResponse createComment(int postId, CreateCommentRequest request, int userId);
    List<CommentResponse> getCommentsByPostId(int postId);
    void deletePost(int postId, int userId);
}

