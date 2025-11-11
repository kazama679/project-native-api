package com.example.project.service.impl;

import com.example.project.model.dto.request.MessageReactionRequest;
import com.example.project.model.dto.request.SendMessageRequest;
import com.example.project.model.dto.response.ConversationResponse;
import com.example.project.model.dto.response.MessageMediaUploadResponse;
import com.example.project.model.dto.response.MessageResponse;
import com.example.project.model.entity.Message;
import com.example.project.model.entity.MessageMedia;
import com.example.project.model.entity.MessageReaction;
import com.example.project.model.entity.User;
import com.example.project.repository.MessageMediaRepository;
import com.example.project.repository.MessageReactionRepository;
import com.example.project.repository.MessageRepository;
import com.example.project.repository.UserRepository;
import com.example.project.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final MessageMediaRepository messageMediaRepository;
    private final MessageReactionRepository messageReactionRepository;
    private final UserRepository userRepository;

    private static final Path MESSAGE_UPLOAD_DIR = Path.of("uploads", "messages");

    @Override
    public MessageResponse sendMessage(SendMessageRequest request, int senderId) {
        if (request.getReceiverId() == null) {
            throw new IllegalArgumentException("Người nhận không hợp lệ");
        }

        if ((request.getContent() == null || request.getContent().trim().isEmpty()) &&
                (request.getMediaItems() == null || request.getMediaItems().isEmpty())) {
            throw new IllegalArgumentException("Tin nhắn phải có nội dung hoặc media");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người gửi"));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người nhận"));

        if (Objects.equals(sender.getId(), receiver.getId())) {
            throw new IllegalStateException("Không thể nhắn tin cho chính mình");
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .isRead(false)
                .isDeleted(false)
                .build();

        Message savedMessage = messageRepository.save(message);

        if (request.getMediaItems() != null && !request.getMediaItems().isEmpty()) {
            List<MessageMedia> mediaEntities = request.getMediaItems().stream()
                    .map(item -> MessageMedia.builder()
                            .message(savedMessage)
                            .mediaUrl(item.getMediaUrl())
                            .mediaType(item.getMediaType())
                            .thumbnailUrl(item.getThumbnailUrl())
                            .build())
                    .collect(Collectors.toList());

            messageMediaRepository.saveAll(mediaEntities);
        }

        return toMessageResponse(savedMessage);
    }

    @Override
    public List<MessageResponse> getConversationMessages(int currentUserId, int partnerId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng hiện tại"));

        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        List<Message> messages = messageRepository.findConversation(currentUser, partner);

        boolean hasUpdate = false;

        for (Message msg : messages) {
            if (Objects.equals(msg.getReceiver().getId(), currentUserId) && Boolean.FALSE.equals(msg.getIsRead())) {
                msg.setIsRead(true);
                hasUpdate = true;
            }
        }

        if (hasUpdate) {
            messageRepository.saveAll(messages);
        }

        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ConversationResponse> getConversations(int currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng hiện tại"));

        List<Message> messages = messageRepository.findAllByParticipant(currentUser);
        Map<Integer, ConversationResponse> conversationMap = new LinkedHashMap<>();

        for (Message message : messages) {
            User partner = Objects.equals(message.getSender().getId(), currentUserId)
                    ? message.getReceiver()
                    : message.getSender();

            conversationMap.computeIfAbsent(partner.getId(), partnerId -> {
                ConversationResponse.ParticipantInfo participantInfo = new ConversationResponse.ParticipantInfo(
                        partner.getId(),
                        partner.getUsername(),
                        partner.getFullName(),
                        partner.getAvatarUrl()
                );

                long unreadCount = messageRepository.countBySenderAndReceiverAndIsReadFalse(partner, currentUser);

                return new ConversationResponse(
                        participantInfo,
                        toMessageResponse(message),
                        unreadCount
                );
            });
        }

        return new ArrayList<>(conversationMap.values());
    }

    @Override
    public MessageResponse reactToMessage(int messageId, int userId, MessageReactionRequest request) {
        Message message = messageRepository.findByIdAndIsDeletedFalse(messageId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tin nhắn"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        if (!Objects.equals(message.getSender().getId(), userId) &&
                !Objects.equals(message.getReceiver().getId(), userId)) {
            throw new IllegalStateException("Bạn không có quyền reaction tin nhắn này");
        }

        MessageReaction reaction = messageReactionRepository.findByMessageAndUser(message, user)
                .map(existing -> {
                    existing.setReactionType(request.getReactionType());
                    return existing;
                })
                .orElseGet(() -> MessageReaction.builder()
                        .message(message)
                        .user(user)
                        .reactionType(request.getReactionType())
                        .build());

        messageReactionRepository.save(reaction);

        return toMessageResponse(message);
    }

    @Override
    public void removeReaction(int messageId, int userId) {
        Message message = messageRepository.findByIdAndIsDeletedFalse(messageId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tin nhắn"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        MessageReaction reaction = messageReactionRepository.findByMessageAndUser(message, user)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy reaction"));

        messageReactionRepository.delete(reaction);
    }

    @Override
    public MessageMediaUploadResponse uploadMedia(MultipartFile file, int userId) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Không có file để upload");
        }

        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng hiện tại"));

        String contentType = file.getContentType();
        MessageMedia.MediaType mediaType;

        if (contentType != null && contentType.startsWith("image")) {
            mediaType = MessageMedia.MediaType.IMAGE;
        } else if (contentType != null && contentType.startsWith("video")) {
            mediaType = MessageMedia.MediaType.VIDEO;
        } else {
            throw new IllegalArgumentException("Định dạng file không hỗ trợ");
        }

        Files.createDirectories(MESSAGE_UPLOAD_DIR);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.lastIndexOf('.') != -1) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        } else if ("image/png".equals(contentType)) {
            extension = ".png";
        } else if ("image/jpeg".equals(contentType)) {
            extension = ".jpg";
        } else if ("video/mp4".equals(contentType)) {
            extension = ".mp4";
        }

        String filename = UUID.randomUUID() + extension;
        Path filePath = MESSAGE_UPLOAD_DIR.resolve(filename);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String mediaUrl = "/uploads/messages/" + filename;

        return new MessageMediaUploadResponse(mediaUrl, mediaType, null);
    }

    private MessageResponse toMessageResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setContent(message.getContent());
        response.setIsRead(Boolean.TRUE.equals(message.getIsRead()));
        response.setCreatedAt(message.getCreatedAt());
        response.setSender(toUserSummary(message.getSender()));
        response.setReceiver(toUserSummary(message.getReceiver()));

        List<MessageMedia> mediaList = messageMediaRepository.findByMessage(message);
        response.setMedia(mediaList.stream()
                .map(media -> new MessageResponse.MediaItem(
                        media.getId(),
                        media.getMediaUrl(),
                        media.getMediaType(),
                        media.getThumbnailUrl()
                ))
                .collect(Collectors.toList()));

        List<MessageReaction> reactions = messageReactionRepository.findByMessage(message);
        response.setReactions(reactions.stream()
                .map(this::toReactionInfo)
                .collect(Collectors.toList()));

        return response;
    }

    private MessageResponse.UserSummary toUserSummary(User user) {
        if (user == null) {
            return null;
        }

        return new MessageResponse.UserSummary(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getAvatarUrl()
        );
    }

    private MessageResponse.ReactionInfo toReactionInfo(MessageReaction reaction) {
        return new MessageResponse.ReactionInfo(
                reaction.getId(),
                toUserSummary(reaction.getUser()),
                reaction.getReactionType(),
                reaction.getCreatedAt() != null ? reaction.getCreatedAt() : LocalDateTime.now()
        );
    }
}


