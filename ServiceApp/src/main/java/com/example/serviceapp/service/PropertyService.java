package com.example.serviceapp.service;

import com.example.serviceapp.dto.PropertyDTO;
import com.example.serviceapp.model.Property;
import com.example.serviceapp.model.PropertyAmenity;
import com.example.serviceapp.repository.PropertyAmenityRepository;
import com.example.serviceapp.repository.PropertyMediaRepository;
import com.example.serviceapp.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
}
