package com.example.serviceapp.controller;

import com.example.serviceapp.model.AmenityMaster;
import com.example.serviceapp.model.PropertyTypeMaster;
import com.example.serviceapp.repository.AmenityMasterRepository;
import com.example.serviceapp.repository.PropertyTypeMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/master")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class MasterDataController {

    @Autowired
    private PropertyTypeMasterRepository propertyTypeMasterRepository;

    @Autowired
    private AmenityMasterRepository amenityMasterRepository;

    @GetMapping("/property-types")
    public ResponseEntity<?> getPropertyTypes() {
        List<String> types = propertyTypeMasterRepository.findByIsActiveTrue()
                .stream()
                .map(PropertyTypeMaster::getTypeName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("status", "success", "propertyTypes", types));
    }

    @GetMapping("/amenities")
    public ResponseEntity<?> getAmenities() {
        List<String> amenities = amenityMasterRepository.findByIsActiveTrue()
                .stream()
                .map(AmenityMaster::getAmenityName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("status", "success", "amenities", amenities));
    }
}
