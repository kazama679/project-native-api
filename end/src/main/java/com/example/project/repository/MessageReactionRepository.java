package com.example.project.repository;

import com.example.project.model.entity.Message;
import com.example.project.model.entity.MessageReaction;
import com.example.project.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Integer> {
    Optional<MessageReaction> findByMessageAndUser(Message message, User user);
    List<MessageReaction> findByMessage(Message message);
    void deleteByMessage(Message message);
}


