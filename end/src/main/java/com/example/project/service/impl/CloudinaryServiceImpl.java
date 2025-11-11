package com.example.project.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.project.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<String, Object> result = uploadImageWithDetails(file, folder);
        return (String) result.get("secure_url");
    }

    @Override
    public Map<String, Object> uploadImageWithDetails(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        try {
            Map<String, Object> uploadParams = new HashMap<>();
            
            // Thêm folder nếu có
            if (folder != null && !folder.isEmpty()) {
                uploadParams.put("folder", folder);
            }
            
            // Upload lên Cloudinary
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder != null ? folder : "",
                            "resource_type", "auto"
                    )
            );

            log.info("Upload thành công: {}", result.get("secure_url"));
            return result;
        } catch (Exception e) {
            log.error("Lỗi khi upload lên Cloudinary: {}", e.getMessage(), e);
            throw new IOException("Không thể upload ảnh lên Cloudinary: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean deleteImage(String publicId) throws IOException {
        try {
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa ảnh từ Cloudinary: {}", e.getMessage(), e);
            throw new IOException("Không thể xóa ảnh từ Cloudinary: " + e.getMessage(), e);
        }
    }
}


