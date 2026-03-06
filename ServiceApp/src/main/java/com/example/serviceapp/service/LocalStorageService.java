package com.example.serviceapp.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service("localStorageService")
public class LocalStorageService implements StorageService {

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        return "https://dummy-storage.com/" + folder + "/" + fileName;
    }

    @Override
    public byte[] downloadFile(String fileUrl) {
        return null;
    }
}
