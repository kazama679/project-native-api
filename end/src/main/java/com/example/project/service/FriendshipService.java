package com.example.project.service;

import com.example.project.model.dto.request.FriendshipRequest;
import com.example.project.model.entity.Friendship;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface FriendshipService {
    List<Friendship> getAllFreFriendships();
    Friendship add(FriendshipRequest fr);
    Friendship update(FriendshipRequest fr, int frId);
    void delete(int frId);
}
