package com.example.serviceapp.service;

import com.example.serviceapp.dto.PropertyDTO;
import com.example.serviceapp.model.Property;
import com.example.serviceapp.model.PropertyAmenity;
import com.example.serviceapp.repository.PropertyAmenityRepository;
import com.example.serviceapp.repository.PropertyMediaRepository;
import com.example.serviceapp.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private PropertyAmenityRepository propertyAmenityRepository;

    @Autowired
    private PropertyMediaRepository propertyMediaRepository;

    @Transactional
    public Property createProperty(PropertyDTO dto, Long userId) {
        try {
            logger.info("Creating property: {}", dto.getTitle());
            Property property = new Property();
            property.setOwnerId(userId);
            property.setTitle(dto.getTitle());
            property.setDescription(dto.getDescription());
            property.setPropertyType(dto.getPropertyType());
            property.setAddress(dto.getLocation());
            property.setCity(dto.getCity());
            property.setEircode(dto.getEircode());
            property.setCounty(dto.getCounty());
            if (dto.getFurnishType() != null) {
                property.setFurnishType(Property.FurnishType.valueOf(dto.getFurnishType().toUpperCase().replace(" ", "_")));
            }
            property.setPrice(dto.getPrice());
            property.setBedrooms(dto.getBedrooms());
            property.setBathrooms(dto.getBathrooms());
            property.setAvailableFrom(dto.getAvailableFrom());
            property.setListingStatus(Property.ListingStatus.AVAILABLE);

            Property savedProperty = propertyRepository.save(property);
            logger.info("Property saved with ID: {}", savedProperty.getPropertyId());

            if (dto.getAmenities() != null && !dto.getAmenities().isEmpty()) {
                for (String amenity : dto.getAmenities()) {
                    PropertyAmenity propertyAmenity = new PropertyAmenity();
                    propertyAmenity.setPropertyId(savedProperty.getPropertyId());
                    propertyAmenity.setAmenityName(amenity);
                    propertyAmenityRepository.save(propertyAmenity);
                }
            }

            return savedProperty;
        } catch (Exception e) {
            logger.error("Error creating property: ", e);
            throw new RuntimeException("Failed to create property: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Property updateProperty(Long propertyId, PropertyDTO dto, Long userId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setPropertyType(dto.getPropertyType());
        property.setAddress(dto.getLocation());
        property.setCity(dto.getCity());
        property.setEircode(dto.getEircode());
        property.setCounty(dto.getCounty());
        if (dto.getFurnishType() != null) {
            property.setFurnishType(Property.FurnishType.valueOf(dto.getFurnishType().toUpperCase().replace(" ", "_")));
        }
        property.setPrice(dto.getPrice());
        property.setBedrooms(dto.getBedrooms());
        property.setBathrooms(dto.getBathrooms());
        property.setAvailableFrom(dto.getAvailableFrom());

        Property updatedProperty = propertyRepository.save(property);

        propertyAmenityRepository.deleteByPropertyId(propertyId);
        if (dto.getAmenities() != null && !dto.getAmenities().isEmpty()) {
            for (String amenity : dto.getAmenities()) {
                PropertyAmenity propertyAmenity = new PropertyAmenity();
                propertyAmenity.setPropertyId(propertyId);
                propertyAmenity.setAmenityName(amenity);
                propertyAmenityRepository.save(propertyAmenity);
            }
        }

        return updatedProperty;
    }

    public List<Property> getUserProperties(Long userId) {
        return propertyRepository.findByOwnerId(userId);
    }

    public Property getPropertyById(Long propertyId) {
        return propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    @Transactional
    public void deleteProperty(Long propertyId, Long userId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        propertyAmenityRepository.deleteByPropertyId(propertyId);
        propertyMediaRepository.deleteByPropertyId(propertyId);
        propertyRepository.delete(property);
    }

    public List<String> getPropertyAmenities(Long propertyId) {
        return propertyAmenityRepository.findByPropertyId(propertyId)
                .stream()
                .map(PropertyAmenity::getAmenityName)
                .collect(Collectors.toList());
    }

    public org.springframework.data.domain.Page<Property> searchProperties(String location, String propertyType, BigDecimal minPrice, BigDecimal maxPrice, Integer bedrooms, LocalDate availableFrom, int page, int size) {
        Specification<Property> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            predicates.add(cb.equal(root.get("listingStatus"), Property.ListingStatus.AVAILABLE));
            
            if (location != null && !location.trim().isEmpty()) {
                String searchPattern = "%" + location.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("city")), searchPattern),
                    cb.like(cb.lower(root.get("county")), searchPattern),
                    cb.like(cb.lower(root.get("eircode")), searchPattern)
                ));
            }
            
            if (propertyType != null && !propertyType.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("propertyType")), propertyType.toLowerCase()));
            }
            
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            
            if (bedrooms != null) {
                predicates.add(cb.equal(root.get("bedrooms"), bedrooms));
            }
            
            if (availableFrom != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("availableFrom"), availableFrom));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );
        return propertyRepository.findAll(spec, pageable);
    }
}
