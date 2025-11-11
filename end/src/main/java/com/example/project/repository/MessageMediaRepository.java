package com.example.project.repository;

import com.example.project.model.entity.Message;
import com.example.project.model.entity.MessageMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageMediaRepository extends JpaRepository<MessageMedia, Integer> {
    List<MessageMedia> findByMessage(Message message);
}


