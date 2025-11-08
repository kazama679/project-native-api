package com.example.project.repository;

import com.example.project.model.entity.Post;
import com.example.project.model.entity.PostReaction;
import com.example.project.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostReactionRepository extends JpaRepository<PostReaction, Integer> {
    Optional<PostReaction> findByPostAndUser(Post post, User user);
    
    List<PostReaction> findByPost(Post post);
    
    @Query("SELECT COUNT(pr) FROM PostReaction pr WHERE pr.post = :post")
    long countByPost(@Param("post") Post post);
    
    boolean existsByPostAndUser(Post post, User user);
}

