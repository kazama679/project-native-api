package com.example.project.repository;

import com.example.project.model.entity.Post;
import com.example.project.model.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, Integer> {
    List<PostMedia> findByPostOrderByOrderIndexAsc(Post post);
    void deleteByPost(Post post);
}

