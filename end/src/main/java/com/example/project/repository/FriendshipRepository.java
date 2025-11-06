package com.example.project.repository;

import com.example.project.model.entity.Friendship;
import com.example.project.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendshipRepository extends JpaRepository<Friendship, Integer> {
    boolean existsByRequesterAndAddressee(User requester, User addressee);
}
