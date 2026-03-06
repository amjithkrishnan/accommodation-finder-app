package com.example.serviceapp.repository;

import com.example.serviceapp.model.PropertyAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyAmenityRepository extends JpaRepository<PropertyAmenity, Long> {
    List<PropertyAmenity> findByPropertyId(Long propertyId);
    void deleteByPropertyId(Long propertyId);
}
