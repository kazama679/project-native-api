package com.example.project.repository;

import com.example.project.model.entity.Comment;
import com.example.project.model.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByPostAndIsDeletedFalseAndParentCommentIsNullOrderByCreatedAtDesc(Post post);
    
    List<Comment> findByPostAndIsDeletedFalseOrderByCreatedAtDesc(Post post);
    
    List<Comment> findByParentCommentAndIsDeletedFalseOrderByCreatedAtAsc(Comment parentComment);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post = :post AND c.isDeleted = false")
    long countByPost(@Param("post") Post post);
}

