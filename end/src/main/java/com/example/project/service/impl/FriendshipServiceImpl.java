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
}
