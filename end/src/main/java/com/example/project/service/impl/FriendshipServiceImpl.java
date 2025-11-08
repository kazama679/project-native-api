package com.example.project.service.impl;

import com.example.project.model.dto.request.FriendshipRequest;
import com.example.project.model.entity.Friendship;
import com.example.project.model.entity.User;
import com.example.project.repository.FriendshipRepository;
import com.example.project.repository.UserRepository;
import com.example.project.service.FriendshipService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Slf4j
@Transactional
public class FriendshipServiceImpl implements FriendshipService {

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<Friendship> getAllFreFriendships() {
        return friendshipRepository.findAll();
    }

    @Override
    public Friendship add(FriendshipRequest request) {
        User requester = userRepository.findById(request.getRequester())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người gửi lời mời"));
        User addressee = userRepository.findById(request.getAddressee())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người nhận lời mời"));

        boolean exists = friendshipRepository.existsByRequesterAndAddressee(requester, addressee)
                || friendshipRepository.existsByRequesterAndAddressee(addressee, requester);
        if (exists) {
            throw new RuntimeException("Đã tồn tại mối quan hệ hoặc lời mời giữa hai người này");
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status(request.toEnumStatus())
                .build();

        return friendshipRepository.save(friendship);
    }

    @Override
    public Friendship update(FriendshipRequest request, int friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mối quan hệ với id: " + friendshipId));

        friendship.setStatus(request.toEnumStatus());
        return friendshipRepository.save(friendship);
    }

    @Override
    public void delete(int friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mối quan hệ với id: " + friendshipId));
        friendshipRepository.delete(friendship);
    }

    @Override
    public List<Friendship> getIncomingRequestsForUser(int userId) {
        User addressee = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + userId));
        return friendshipRepository.findPendingByAddressee(addressee);
    }

    @Override
    public Friendship acceptFriendship(int friendshipId, int currentUserId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mối quan hệ với id: " + friendshipId));

        if (friendship.getAddressee() == null || friendship.getAddressee().getId() != currentUserId) {
            throw new IllegalStateException("Bạn không có quyền chấp nhận lời mời này");
        }

        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }

    @Override
    public Friendship followUser(int targetUserId, int currentUserId) {
        if (targetUserId == currentUserId) {
            throw new IllegalArgumentException("Không thể theo dõi chính mình");
        }

        User requester = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + currentUserId));
        User addressee = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + targetUserId));

        boolean exists = friendshipRepository.existsByRequesterAndAddressee(requester, addressee)
                || friendshipRepository.existsByRequesterAndAddressee(addressee, requester);
        if (exists) {
            throw new RuntimeException("Đã tồn tại mối quan hệ hoặc lời mời giữa hai người này");
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status(Friendship.FriendshipStatus.ACCEPTED)
                .build();

        return friendshipRepository.save(friendship);
    }

    @Override
    public Friendship sendFriendRequest(int targetUserId, int currentUserId) {
        if (targetUserId == currentUserId) {
            throw new IllegalArgumentException("Không thể gửi lời mời kết bạn cho chính mình");
        }

        User requester = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + currentUserId));
        User addressee = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + targetUserId));

        // Kiểm tra xem đã có mối quan hệ nào chưa
        java.util.Optional<Friendship> existing = friendshipRepository.findBetweenUsers(requester, addressee);
        if (existing.isPresent()) {
            Friendship existingFriendship = existing.get();
            if (existingFriendship.getStatus() == Friendship.FriendshipStatus.PENDING) {
                throw new RuntimeException("Đã tồn tại lời mời kết bạn giữa hai người này");
            } else if (existingFriendship.getStatus() == Friendship.FriendshipStatus.ACCEPTED) {
                throw new RuntimeException("Hai người đã là bạn bè");
            } else if (existingFriendship.getStatus() == Friendship.FriendshipStatus.BLOCKED) {
                throw new RuntimeException("Không thể gửi lời mời kết bạn do đã bị chặn");
            }
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status(Friendship.FriendshipStatus.PENDING)
                .build();

        return friendshipRepository.save(friendship);
    }

    @Override
    public void unfriend(int targetUserId, int currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + currentUserId));
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + targetUserId));

        java.util.Optional<Friendship> friendship = friendshipRepository.findAcceptedBetween(currentUser, targetUser);
        if (friendship.isEmpty()) {
            throw new NoSuchElementException("Hai người không phải là bạn bè");
        }

        friendshipRepository.delete(friendship.get());
    }

    @Override
    public void cancelFriendRequest(int friendshipId, int currentUserId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy lời mời kết bạn với id: " + friendshipId));

        if (friendship.getRequester().getId() != currentUserId) {
            throw new IllegalStateException("Bạn không có quyền hủy lời mời này");
        }

        if (friendship.getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể hủy lời mời đang chờ duyệt");
        }

        friendshipRepository.delete(friendship);
    }

    @Override
    public void blockFriend(int targetUserId, int currentUserId) {
        if (targetUserId == currentUserId) {
            throw new IllegalArgumentException("Không thể chặn chính mình");
        }

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + currentUserId));
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + targetUserId));

        java.util.Optional<Friendship> existing = friendshipRepository.findBetweenUsers(currentUser, targetUser);
        
        if (existing.isPresent()) {
            Friendship friendship = existing.get();
            // Nếu đã bị chặn rồi thì không làm gì
            if (friendship.getStatus() == Friendship.FriendshipStatus.BLOCKED) {
                return;
            }
            // Cập nhật trạng thái thành BLOCKED, đảm bảo currentUser là requester
            if (friendship.getRequester().getId() == currentUserId) {
                friendship.setStatus(Friendship.FriendshipStatus.BLOCKED);
            } else {
                // Nếu currentUser là addressee, cần đảo ngược hoặc tạo mới
                friendshipRepository.delete(friendship);
                Friendship blockedFriendship = Friendship.builder()
                        .requester(currentUser)
                        .addressee(targetUser)
                        .status(Friendship.FriendshipStatus.BLOCKED)
                        .build();
                friendshipRepository.save(blockedFriendship);
            }
        } else {
            // Tạo mới với trạng thái BLOCKED
            Friendship blockedFriendship = Friendship.builder()
                    .requester(currentUser)
                    .addressee(targetUser)
                    .status(Friendship.FriendshipStatus.BLOCKED)
                    .build();
            friendshipRepository.save(blockedFriendship);
        }
    }

    @Override
    public java.util.List<Friendship> getFriendsList(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + userId));
        return friendshipRepository.findFriendsByUser(user);
    }

    @Override
    public java.util.List<Friendship> getOutgoingRequestsForUser(int userId) {
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + userId));
        return friendshipRepository.findPendingByRequester(requester);
    }

    @Override
    public java.util.List<User> getFollowers(int userId) {
        User addressee = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + userId));
        java.util.List<Friendship> friendships = friendshipRepository.findAcceptedByAddressee(addressee);
        java.util.Set<Integer> seen = new java.util.HashSet<>();
        java.util.List<User> followers = new java.util.ArrayList<>();
        for (Friendship f : friendships) {
            User requester = f.getRequester();
            if (requester != null && seen.add(requester.getId())) {
                followers.add(requester);
            }
        }
        return followers;
    }

    @Override
    public java.util.List<User> getFollowing(int userId) {
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng: " + userId));
        java.util.List<Friendship> friendships = friendshipRepository.findAcceptedByRequester(requester);
        java.util.Set<Integer> seen = new java.util.HashSet<>();
        java.util.List<User> following = new java.util.ArrayList<>();
        for (Friendship f : friendships) {
            User addressee = f.getAddressee();
            if (addressee != null && seen.add(addressee.getId())) {
                following.add(addressee);
            }
        }
        return following;
    }
}
