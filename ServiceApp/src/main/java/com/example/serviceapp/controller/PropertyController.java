package com.example.serviceapp.controller;

import com.example.serviceapp.dto.PropertyDTO;
import com.example.serviceapp.dto.ResponseDTO;
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

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createPropertyWithMedia(
            @RequestBody Map<String, Object> requestBody,
            HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
            }

            PropertyDTO propertyDTO = new PropertyDTO();
            propertyDTO.setTitle((String) requestBody.get("title"));
            propertyDTO.setDescription((String) requestBody.get("description"));
            propertyDTO.setPropertyType((String) requestBody.get("propertyType"));
            propertyDTO.setLocation((String) requestBody.get("location"));
            propertyDTO.setCity((String) requestBody.get("city"));
            propertyDTO.setEircode((String) requestBody.get("eircode"));
            propertyDTO.setCounty((String) requestBody.get("county"));
            propertyDTO.setFurnishType((String) requestBody.get("furnishType"));
            propertyDTO.setPrice(new BigDecimal(requestBody.get("price").toString()));
            propertyDTO.setBedrooms(Integer.parseInt(requestBody.get("bedrooms").toString()));
            propertyDTO.setBathrooms(Integer.parseInt(requestBody.get("bathrooms").toString()));
            propertyDTO.setAvailableFrom(LocalDate.parse((String) requestBody.get("availableFrom")));
            
            Object amenitiesObj = requestBody.get("amenities");
            System.out.println("Amenities object type: " + (amenitiesObj != null ? amenitiesObj.getClass().getName() : "null"));
            System.out.println("Amenities value: " + amenitiesObj);
            if (amenitiesObj instanceof List) {
                propertyDTO.setAmenities((List<String>) amenitiesObj);
            }

            Property property = propertyService.createProperty(propertyDTO, user.getId());

            List<Map<String, Object>> mediaList = (List<Map<String, Object>>) requestBody.get("media");
            if (mediaList != null) {
                for (int i = 0; i < mediaList.size(); i++) {
                    Map<String, Object> media = mediaList.get(i);
                    PropertyMedia propertyMedia = new PropertyMedia();
                    propertyMedia.setPropertyId(property.getPropertyId());
                    propertyMedia.setMediaUrl((String) media.get("mediaUrl"));
                    propertyMedia.setThumbnailUrl((String) media.get("thumbnailUrl"));
                    propertyMedia.setS3Key((String) media.get("s3Key"));
                    propertyMedia.setThumbnailS3Key((String) media.get("thumbnailS3Key"));
                    propertyMedia.setMediaType(PropertyMedia.MediaType.valueOf((String) media.get("mediaType")));
                    propertyMedia.setDisplayOrder(i);
                    propertyMedia.setIsPrimary(i == 0);
                    propertyMediaRepository.save(propertyMedia);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Property created successfully");
            response.put("propertyId", property.getPropertyId());
            
            return ResponseEntity.ok(ResponseDTO.success(response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResponseDTO.failed(e.getMessage(), "INTERNAL_ERROR"));
        }
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createProperty(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("propertyType") String propertyType,
            @RequestParam("location") String location,
            @RequestParam("city") String city,
            @RequestParam(value = "eircode", required = false) String eircode,
            @RequestParam(value = "county", required = false) String county,
            @RequestParam(value = "furnishType", required = false) String furnishType,
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
            }

            PropertyDTO propertyDTO = new PropertyDTO();
            propertyDTO.setTitle(title);
            propertyDTO.setDescription(description);
            propertyDTO.setPropertyType(propertyType);
            propertyDTO.setLocation(location);
            propertyDTO.setCity(city);
            propertyDTO.setEircode(eircode);
            propertyDTO.setCounty(county);
            propertyDTO.setFurnishType(furnishType);
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
                    media.setDisplayOrder(displayOrder);
                    media.setIsPrimary(displayOrder == 0);
                    displayOrder++;
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
                    media.setDisplayOrder(displayOrder);
                    displayOrder++;
                    propertyMediaRepository.save(media);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Property created successfully");
            response.put("propertyId", property.getPropertyId());
            
            return ResponseEntity.ok(ResponseDTO.success(response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.failed(e.getMessage(), "INTERNAL_ERROR"));
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
            @RequestParam(value = "eircode", required = false) String eircode,
            @RequestParam(value = "county", required = false) String county,
            @RequestParam(value = "furnishType", required = false) String furnishType,
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
            }

            PropertyDTO propertyDTO = new PropertyDTO();
            propertyDTO.setTitle(title);
            propertyDTO.setDescription(description);
            propertyDTO.setPropertyType(propertyType);
            propertyDTO.setLocation(location);
            propertyDTO.setCity(city);
            propertyDTO.setEircode(eircode);
            propertyDTO.setCounty(county);
            propertyDTO.setFurnishType(furnishType);
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
                    media.setDisplayOrder(displayOrder);
                    displayOrder++;
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
                    media.setDisplayOrder(displayOrder);
                    displayOrder++;
                    propertyMediaRepository.save(media);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Property updated successfully");
            response.put("propertyId", property.getPropertyId());
            
            return ResponseEntity.ok(ResponseDTO.success(response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.failed(e.getMessage(), "FORBIDDEN"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.failed(e.getMessage(), "INTERNAL_ERROR"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProperties(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) String availableFrom,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            LocalDate availableDate = null;
            if (availableFrom != null && !availableFrom.isEmpty()) {
                availableDate = LocalDate.parse(availableFrom);
            }
            
            org.springframework.data.domain.Page<Property> propertyPage = propertyService.searchProperties(
                location, propertyType, minPrice, maxPrice, bedrooms, availableDate, page, size);
            
            List<Map<String, Object>> propertyList = propertyPage.getContent().stream().map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getPropertyId());
                map.put("name", p.getTitle());
                map.put("location", p.getCity());
                map.put("propertyType", p.getPropertyType());
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
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", propertyList);
            response.put("totalElements", propertyPage.getTotalElements());
            response.put("totalPages", propertyPage.getTotalPages());
            response.put("currentPage", page);
            
            return ResponseEntity.ok(ResponseDTO.success(Map.of("properties", response)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.failed(e.getMessage(), "INTERNAL_ERROR"));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserProperties(HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
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
            
            return ResponseEntity.ok(ResponseDTO.success(Map.of("properties", propertyList)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.failed(e.getMessage(), "INTERNAL_ERROR"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProperty(@PathVariable Long id, HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
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
            
            return ResponseEntity.ok(ResponseDTO.success(Map.of("property", response)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseDTO.failed(e.getMessage(), "NOT_FOUND"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id, HttpSession session) {
        try {
            UserDTO user = (UserDTO) session.getAttribute("USER");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseDTO.failed("Not authenticated", "NOT_AUTHENTICATED"));
            }

            propertyService.deleteProperty(id, user.getId());
            
            return ResponseEntity.ok(ResponseDTO.success(Map.of("message", "Property deleted successfully")));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.failed(e.getMessage(), "FORBIDDEN"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.failed(e.getMessage(), "INTERNAL_ERROR"));
        }
    }
}
