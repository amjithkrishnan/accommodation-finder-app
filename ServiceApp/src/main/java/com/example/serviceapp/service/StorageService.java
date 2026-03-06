package com.example.serviceapp.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String uploadFile(MultipartFile file, String folder);
    byte[] downloadFile(String fileUrl);
}
