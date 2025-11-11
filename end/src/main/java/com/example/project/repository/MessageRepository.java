package com.example.project.repository;

import com.example.project.model.entity.Message;
import com.example.project.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    @Query("SELECT m FROM Message m " +
            "WHERE m.isDeleted = false AND " +
            "((m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1)) " +
            "ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT m FROM Message m " +
            "WHERE m.isDeleted = false AND (m.sender = :user OR m.receiver = :user) " +
            "ORDER BY m.createdAt DESC")
    List<Message> findAllByParticipant(@Param("user") User user);

    Optional<Message> findByIdAndIsDeletedFalse(Integer id);

    long countBySenderAndReceiverAndIsReadFalse(User sender, User receiver);
}


