package com.example.project.repository;

import com.example.project.model.entity.Post;
import com.example.project.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    List<Post> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(User user);
    
    Optional<Post> findByIdAndIsDeletedFalse(Integer id);
    
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND p.user = :user ORDER BY p.createdAt DESC")
    List<Post> findPostsByUser(@Param("user") User user);
    
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND " +
           "(p.privacyMode = com.example.project.model.entity.Post$PrivacyMode.PUBLIC OR " +
           "(p.privacyMode = com.example.project.model.entity.Post$PrivacyMode.FRIENDS AND " +
           "EXISTS (SELECT f FROM Friendship f WHERE " +
           "((f.requester = :currentUser AND f.addressee = p.user) OR " +
           "(f.requester = p.user AND f.addressee = :currentUser)) AND " +
           "f.status = com.example.project.model.entity.Friendship$FriendshipStatus.ACCEPTED)) OR " +
           "p.user = :currentUser) " +
           "ORDER BY p.createdAt DESC")
    List<Post> findFeedPosts(@Param("currentUser") User currentUser);
}

