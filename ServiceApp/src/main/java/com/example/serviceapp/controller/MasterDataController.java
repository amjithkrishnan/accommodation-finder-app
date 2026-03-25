package com.example.serviceapp.controller;

import com.example.serviceapp.dto.ResponseDTO;
import com.example.serviceapp.model.AmenityMaster;
import com.example.serviceapp.model.County;
import com.example.serviceapp.model.PropertyTypeMaster;
import com.example.serviceapp.repository.AmenityMasterRepository;
import com.example.serviceapp.repository.CountyRepository;
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

    @Autowired
    private CountyRepository countyRepository;

    @GetMapping("/all")
    public ResponseEntity<?> getAllMasterData() {
        List<String> types = propertyTypeMasterRepository.findByIsActiveTrue()
                .stream()
                .map(PropertyTypeMaster::getTypeName)
                .collect(Collectors.toList());
        
        List<String> amenities = amenityMasterRepository.findByIsActiveTrue()
                .stream()
                .map(AmenityMaster::getAmenityName)
                .collect(Collectors.toList());
        
        List<String> counties = countyRepository.findAll()
                .stream()
                .map(County::getName)
                .collect(Collectors.toList());
        
        Map<String, Object> data = Map.of(
            "propertyTypes", types,
            "amenities", amenities,
            "counties", counties
        );
        return ResponseEntity.ok(ResponseDTO.success(data));
    }

    @GetMapping("/property-types")
    public ResponseEntity<?> getPropertyTypes() {
        List<String> types = propertyTypeMasterRepository.findByIsActiveTrue()
                .stream()
                .map(PropertyTypeMaster::getTypeName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ResponseDTO.success(Map.of("propertyTypes", types)));
    }

    @GetMapping("/amenities")
    public ResponseEntity<?> getAmenities() {
        List<String> amenities = amenityMasterRepository.findByIsActiveTrue()
                .stream()
                .map(AmenityMaster::getAmenityName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ResponseDTO.success(Map.of("amenities", amenities)));
    }

    @GetMapping("/counties")
    public ResponseEntity<?> getCounties() {
        List<String> counties = countyRepository.findAll()
                .stream()
                .map(County::getName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ResponseDTO.success(Map.of("counties", counties)));
    }
}
