package com.example.project.repository;

import com.example.project.model.entity.Friendship;
import com.example.project.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FriendshipRepository extends JpaRepository<Friendship, Integer> {
    boolean existsByRequesterAndAddressee(User requester, User addressee);

    @Query("SELECT f FROM Friendship f WHERE f.addressee = :addressee AND f.status = com.example.project.model.entity.Friendship$FriendshipStatus.PENDING")
    java.util.List<Friendship> findPendingByAddressee(@Param("addressee") User addressee);

    @Query("SELECT f FROM Friendship f WHERE f.requester = :requester AND f.status = com.example.project.model.entity.Friendship$FriendshipStatus.PENDING")
    java.util.List<Friendship> findPendingByRequester(@Param("requester") User requester);

    @Query("SELECT f FROM Friendship f WHERE ((f.requester = :user1 AND f.addressee = :user2) OR (f.requester = :user2 AND f.addressee = :user1)) AND f.status = com.example.project.model.entity.Friendship$FriendshipStatus.ACCEPTED")
    java.util.Optional<Friendship> findAcceptedBetween(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT f FROM Friendship f WHERE ((f.requester = :user OR f.addressee = :user) AND f.status = com.example.project.model.entity.Friendship$FriendshipStatus.ACCEPTED)")
    java.util.List<Friendship> findFriendsByUser(@Param("user") User user);

    @Query("SELECT f FROM Friendship f WHERE ((f.requester = :user1 AND f.addressee = :user2) OR (f.requester = :user2 AND f.addressee = :user1))")
    java.util.Optional<Friendship> findBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT f FROM Friendship f WHERE f.addressee = :addressee AND f.status = com.example.project.model.entity.Friendship$FriendshipStatus.ACCEPTED")
    java.util.List<Friendship> findAcceptedByAddressee(@Param("addressee") User addressee);

    @Query("SELECT f FROM Friendship f WHERE f.requester = :requester AND f.status = com.example.project.model.entity.Friendship$FriendshipStatus.ACCEPTED")
    java.util.List<Friendship> findAcceptedByRequester(@Param("requester") User requester);
}
