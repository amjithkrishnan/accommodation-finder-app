package com.example.serviceapp.controller;

import com.example.serviceapp.dto.PropertyDTO;
import com.example.serviceapp.dto.UserDTO;
import com.example.serviceapp.model.Property;
import com.example.serviceapp.model.PropertyMedia;
import com.example.serviceapp.repository.PropertyMediaRepository;
import com.example.serviceapp.service.PropertyService;
import com.example.serviceapp.service.StorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PropertyMediaRepository propertyMediaRepository;

    @Value("${app.storage.mode}")
    private String storageMode;

    @Autowired
    @Qualifier("s3StorageService")
    private StorageService s3Service;

    @Autowired
    @Qualifier("localStorageService")
    private StorageService localService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createProperty(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("propertyType") String propertyType,
            @RequestParam("location") String location,
            @RequestParam("city") String city,
            @RequestParam("price") BigDecimal price,
            @RequestParam("bedrooms") Integer bedrooms,
            @RequestParam("bathrooms") Integer bathrooms,
            @RequestParam("availableFrom") String availableFrom,
            @RequestParam(value = "amenities", required = false) List<String> amenities,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "videos", required = false) List<MultipartFile> videos,
            HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("status", "error", "message", "Not authenticated"));
            }

            PropertyDTO propertyDTO = new PropertyDTO();
            propertyDTO.setTitle(title);
            propertyDTO.setDescription(description);
            propertyDTO.setPropertyType(propertyType);
            propertyDTO.setLocation(location);
            propertyDTO.setCity(city);
            propertyDTO.setPrice(price);
            propertyDTO.setBedrooms(bedrooms);
            propertyDTO.setBathrooms(bathrooms);
            propertyDTO.setAvailableFrom(LocalDate.parse(availableFrom));
            propertyDTO.setAmenities(amenities);

            Property property = propertyService.createProperty(propertyDTO, user.getId());
            
            StorageService storageService = "s3".equals(storageMode) ? s3Service : localService;
            
            int displayOrder = 0;
            if (images != null) {
                for (MultipartFile image : images) {
                    String imageUrl = storageService.uploadFile(image, "properties");
                    PropertyMedia media = new PropertyMedia();
                    media.setPropertyId(property.getPropertyId());
                    media.setMediaUrl(imageUrl);
                    media.setMediaType(PropertyMedia.MediaType.IMAGE);
                    media.setDisplayOrder(displayOrder++);
                    media.setIsPrimary(displayOrder == 1);
                    propertyMediaRepository.save(media);
                }
            }
            
            if (videos != null) {
                for (MultipartFile video : videos) {
                    String videoUrl = storageService.uploadFile(video, "properties");
                    PropertyMedia media = new PropertyMedia();
                    media.setPropertyId(property.getPropertyId());
                    media.setMediaUrl(videoUrl);
                    media.setMediaType(PropertyMedia.MediaType.VIDEO);
                    media.setDisplayOrder(displayOrder++);
                    propertyMediaRepository.save(media);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Property created successfully");
            response.put("propertyId", property.getPropertyId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateProperty(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("propertyType") String propertyType,
            @RequestParam("location") String location,
            @RequestParam("city") String city,
            @RequestParam("price") BigDecimal price,
            @RequestParam("bedrooms") Integer bedrooms,
            @RequestParam("bathrooms") Integer bathrooms,
            @RequestParam("availableFrom") String availableFrom,
            @RequestParam(value = "amenities", required = false) List<String> amenities,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "videos", required = false) List<MultipartFile> videos,
            HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("status", "error", "message", "Not authenticated"));
            }

            PropertyDTO propertyDTO = new PropertyDTO();
            propertyDTO.setTitle(title);
            propertyDTO.setDescription(description);
            propertyDTO.setPropertyType(propertyType);
            propertyDTO.setLocation(location);
            propertyDTO.setCity(city);
            propertyDTO.setPrice(price);
            propertyDTO.setBedrooms(bedrooms);
            propertyDTO.setBathrooms(bathrooms);
            propertyDTO.setAvailableFrom(LocalDate.parse(availableFrom));
            propertyDTO.setAmenities(amenities);

            Property property = propertyService.updateProperty(id, propertyDTO, user.getId());
            
            StorageService storageService = "s3".equals(storageMode) ? s3Service : localService;
            
            if (images != null) {
                int displayOrder = (int) propertyMediaRepository.findByPropertyIdOrderByDisplayOrder(id).stream().count();
                for (MultipartFile image : images) {
                    String imageUrl = storageService.uploadFile(image, "properties");
                    PropertyMedia media = new PropertyMedia();
                    media.setPropertyId(property.getPropertyId());
                    media.setMediaUrl(imageUrl);
                    media.setMediaType(PropertyMedia.MediaType.IMAGE);
                    media.setDisplayOrder(displayOrder++);
                    propertyMediaRepository.save(media);
                }
            }
            
            if (videos != null) {
                int displayOrder = (int) propertyMediaRepository.findByPropertyIdOrderByDisplayOrder(id).stream().count();
                for (MultipartFile video : videos) {
                    String videoUrl = storageService.uploadFile(video, "properties");
                    PropertyMedia media = new PropertyMedia();
                    media.setPropertyId(property.getPropertyId());
                    media.setMediaUrl(videoUrl);
                    media.setMediaType(PropertyMedia.MediaType.VIDEO);
                    media.setDisplayOrder(displayOrder++);
                    propertyMediaRepository.save(media);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Property updated successfully");
            response.put("propertyId", property.getPropertyId());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserProperties(HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("status", "error", "message", "Not authenticated"));
            }

            List<Property> properties = propertyService.getUserProperties(user.getId());
            
            List<Map<String, Object>> propertyList = properties.stream().map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getPropertyId());
                map.put("name", p.getTitle());
                map.put("location", p.getCity());
                map.put("propertyType", p.getPropertyType().toString());
                map.put("price", "€" + p.getPrice());
                map.put("beds", p.getBedrooms());
                map.put("bath", p.getBathrooms());
                map.put("status", p.getListingStatus().toString());
                map.put("availableFrom", p.getAvailableFrom());
                map.put("description", p.getDescription());
                map.put("amenities", propertyService.getPropertyAmenities(p.getPropertyId()));
                
                List<PropertyMedia> media = propertyMediaRepository.findByPropertyIdOrderByDisplayOrder(p.getPropertyId());
                if (!media.isEmpty()) {
                    map.put("image", media.get(0).getMediaUrl());
                }
                
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of("status", "success", "properties", propertyList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProperty(@PathVariable Long id, HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("status", "error", "message", "Not authenticated"));
            }

            Property property = propertyService.getPropertyById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", property.getPropertyId());
            response.put("name", property.getTitle());
            response.put("location", property.getCity());
            response.put("propertyType", property.getPropertyType().toString());
            response.put("price", property.getPrice());
            response.put("beds", property.getBedrooms());
            response.put("bath", property.getBathrooms());
            response.put("status", property.getListingStatus().toString());
            response.put("availableFrom", property.getAvailableFrom());
            response.put("description", property.getDescription());
            response.put("amenities", propertyService.getPropertyAmenities(property.getPropertyId()));
            
            return ResponseEntity.ok(Map.of("status", "success", "property", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id, HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("status", "error", "message", "Not authenticated"));
            }

            propertyService.deleteProperty(id, user.getId());
            
            return ResponseEntity.ok(Map.of("status", "success", "message", "Property deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
