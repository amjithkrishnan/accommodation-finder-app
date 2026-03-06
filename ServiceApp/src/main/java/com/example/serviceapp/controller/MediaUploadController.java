package com.example.serviceapp.controller;

import com.example.serviceapp.dto.UserDTO;
import com.example.serviceapp.model.PropertyMedia;
import com.example.serviceapp.repository.PropertyMediaRepository;
import com.example.serviceapp.service.StorageService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class MediaUploadController {

    @Autowired
    @Qualifier("s3StorageService")
    private StorageService storageService;

    @Autowired
    private PropertyMediaRepository propertyMediaRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMedia(@RequestParam("file") MultipartFile file,
                                         @RequestParam("propertyId") Long propertyId,
                                         @RequestParam("mediaType") String mediaType,
                                         HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("status", "error", "message", "Not authenticated"));
            }

            StorageService storage = storageService;
            String folder = mediaType.equals("VIDEO") ? "videos" : "images";
            String fileUrl = storage.uploadFile(file, folder);

            PropertyMedia media = new PropertyMedia();
            media.setPropertyId(propertyId);
            media.setMediaUrl(fileUrl);
            media.setMediaType(PropertyMedia.MediaType.valueOf(mediaType));
            propertyMediaRepository.save(media);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("url", fileUrl);
            response.put("mediaId", media.getMediaId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping("/presigned-url")
    public ResponseEntity<?> getPresignedUrl(@RequestParam("fileName") String fileName,
                                             @RequestParam("contentType") String contentType,
                                             @RequestParam("mediaType") String mediaType,
                                             HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("status", "error", "message", "Not authenticated"));
            }

            if (storageService == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("status", "error", "message", "S3 service not available"));
            }

            String folder = mediaType.equals("VIDEO") ? "videos" : "images";
            com.example.serviceapp.service.S3Service s3 = (com.example.serviceapp.service.S3Service) storageService;
            String presignedUrl = s3.generatePresignedUrl(fileName, contentType, folder);

            return ResponseEntity.ok(Map.of("status", "success", "url", presignedUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
