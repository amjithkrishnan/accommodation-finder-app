package com.example.serviceapp.dto;

public class MediaUploadDTO {
    private String mediaUrl;
    private String thumbnailUrl;
    private String s3Key;
    private String thumbnailS3Key;
    private String mediaType;
    private String fileName;
    private Long fileSize;

    public MediaUploadDTO() {}

    public MediaUploadDTO(String mediaUrl, String thumbnailUrl, String s3Key, String thumbnailS3Key, 
                         String mediaType, String fileName, Long fileSize) {
        this.mediaUrl = mediaUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.s3Key = s3Key;
        this.thumbnailS3Key = thumbnailS3Key;
        this.mediaType = mediaType;
        this.fileName = fileName;
        this.fileSize = fileSize;
    }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public String getS3Key() { return s3Key; }
    public void setS3Key(String s3Key) { this.s3Key = s3Key; }
    public String getThumbnailS3Key() { return thumbnailS3Key; }
    public void setThumbnailS3Key(String thumbnailS3Key) { this.thumbnailS3Key = thumbnailS3Key; }
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
}
