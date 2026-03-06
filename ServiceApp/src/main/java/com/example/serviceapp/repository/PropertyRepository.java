package com.example.serviceapp.repository;

import com.example.serviceapp.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByCity(String city);
    List<Property> findByPropertyType(String propertyType);
    List<Property> findByListingStatus(Property.ListingStatus listingStatus);
    List<Property> findByOwnerId(Long ownerId);
}
