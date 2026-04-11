package com.example.serviceapp.controller;

import com.example.serviceapp.dto.MediaUploadDTO;
import com.example.serviceapp.dto.ResponseDTO;
import com.example.serviceapp.dto.UserDTO;
import com.example.serviceapp.service.S3Service;
import com.example.serviceapp.service.StorageService;
import com.example.serviceapp.util.ImageThumbnailUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class MediaUploadController {

    @Autowired(required = false)
    @Qualifier("s3StorageService")
    private S3Service s3Service;

    @Autowired(required = false)
    private software.amazon.awssdk.services.s3.S3Client s3Client;

    @Value("${app.storage.mode}")
    private String storageMode;

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    @Value("${aws.s3.region:eu-west-1}")
    private String region;

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList("image/jpeg", "image/jpg", "image/png");
    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList("video/mp4", "video/mpeg", "video/quicktime");

    @PostMapping("/images")
    public ResponseEntity<?> uploadImages(@RequestParam("files") List<MultipartFile> files, HttpSession session) {
        UserDTO user = (UserDTO) session.getAttribute("USER");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
        }
        List<MediaUploadDTO> results = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                if (file.isEmpty() || file.getSize() > MAX_IMAGE_SIZE || !ALLOWED_IMAGE_TYPES.contains(file.getContentType())) continue;
                String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
                String s3Key = "properties/" + fileName;
                byte[] originalBytes = file.getBytes();
                String originalUrl = uploadToS3(originalBytes, s3Key, file.getContentType());
                byte[] thumbnailBytes = ImageThumbnailUtil.generateThumbnail(originalBytes);
                String thumbnailKey = "properties/thumbnails/" + fileName;
                String thumbnailUrl = uploadToS3(thumbnailBytes, thumbnailKey, "image/jpeg");
                results.add(new MediaUploadDTO(originalUrl, thumbnailUrl, s3Key, thumbnailKey, "IMAGE", file.getOriginalFilename(), file.getSize()));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return ResponseEntity.ok(ResponseDTO.success(results));
    }

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file, HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ResponseDTO.failed("File is empty", "EMPTY_FILE"));
            }

            if (file.getSize() > MAX_IMAGE_SIZE) {
                return ResponseEntity.badRequest()
                    .body(ResponseDTO.failed("File size exceeds 5MB limit", "FILE_TOO_LARGE"));
            }

            if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
                return ResponseEntity.badRequest()
                    .body(ResponseDTO.failed("Invalid file type. Only JPG, JPEG, PNG allowed", "INVALID_FILE_TYPE"));
            }

            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            String s3Key = "properties/" + fileName;
            
            byte[] originalBytes = file.getBytes();
            String originalUrl = uploadToS3(originalBytes, s3Key, file.getContentType());

            byte[] thumbnailBytes = ImageThumbnailUtil.generateThumbnail(originalBytes);
            String thumbnailKey = "properties/thumbnails/" + fileName;
            String thumbnailUrl = uploadToS3(thumbnailBytes, thumbnailKey, "image/jpeg");

            MediaUploadDTO uploadDTO = new MediaUploadDTO(
                originalUrl, thumbnailUrl, s3Key, thumbnailKey,
                "IMAGE", file.getOriginalFilename(), file.getSize()
            );

            return ResponseEntity.ok(ResponseDTO.success(uploadDTO));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResponseDTO.failed("Failed to upload image: " + e.getMessage(), "UPLOAD_FAILED"));
        }
    }

    @PostMapping("/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file, HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ResponseDTO.failed("File is empty", "EMPTY_FILE"));
            }

            if (file.getSize() > MAX_VIDEO_SIZE) {
                return ResponseEntity.badRequest()
                    .body(ResponseDTO.failed("File size exceeds 50MB limit", "FILE_TOO_LARGE"));
            }

            if (!ALLOWED_VIDEO_TYPES.contains(file.getContentType())) {
                return ResponseEntity.badRequest()
                    .body(ResponseDTO.failed("Invalid file type. Only MP4, MPEG, MOV allowed", "INVALID_FILE_TYPE"));
            }

            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            String s3Key = "properties/videos/" + fileName;
            
            String videoUrl = uploadToS3(file.getBytes(), s3Key, file.getContentType());

            MediaUploadDTO uploadDTO = new MediaUploadDTO(
                videoUrl, null, s3Key, null,
                "VIDEO", file.getOriginalFilename(), file.getSize()
            );

            return ResponseEntity.ok(ResponseDTO.success(uploadDTO));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResponseDTO.failed("Failed to upload video: " + e.getMessage(), "UPLOAD_FAILED"));
        }
    }

    private String uploadToS3(byte[] fileBytes, String key, String contentType) {
        if ("s3".equals(storageMode)) {
            software.amazon.awssdk.core.sync.RequestBody requestBody = 
                software.amazon.awssdk.core.sync.RequestBody.fromBytes(fileBytes);
            
            software.amazon.awssdk.services.s3.model.PutObjectRequest putRequest = 
                software.amazon.awssdk.services.s3.model.PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();
            
            s3Client.putObject(putRequest, requestBody);
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
        }
        throw new RuntimeException("Only S3 storage mode supported for separate uploads");
    }
}
