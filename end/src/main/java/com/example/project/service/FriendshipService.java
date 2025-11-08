package com.example.project.service;

import com.example.project.model.dto.request.FriendshipRequest;
import com.example.project.model.entity.Friendship;
import org.springframework.stereotype.Service;

import java.util.List;
import com.example.project.model.entity.User;

@Service
public interface FriendshipService {
    List<Friendship> getAllFreFriendships();
    Friendship add(FriendshipRequest fr);
    Friendship update(FriendshipRequest fr, int frId);
    void delete(int frId);

    // New methods for app flows
    java.util.List<Friendship> getIncomingRequestsForUser(int userId);
    java.util.List<Friendship> getOutgoingRequestsForUser(int userId);
    Friendship acceptFriendship(int friendshipId, int currentUserId);
    Friendship followUser(int targetUserId, int currentUserId);
    
    // Friend management methods
    Friendship sendFriendRequest(int targetUserId, int currentUserId);
    void unfriend(int targetUserId, int currentUserId);
    void cancelFriendRequest(int friendshipId, int currentUserId);
    void blockFriend(int targetUserId, int currentUserId);
    java.util.List<Friendship> getFriendsList(int userId);
    java.util.List<User> getFollowers(int userId);
    java.util.List<User> getFollowing(int userId);
}
