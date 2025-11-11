package com.example.project.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    String uploadImage(MultipartFile file, String folder) throws IOException;
    Map<String, Object> uploadImageWithDetails(MultipartFile file, String folder) throws IOException;
    boolean deleteImage(String publicId) throws IOException;
}


