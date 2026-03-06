package com.example.serviceapp.repository;

import com.example.serviceapp.model.PropertyMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyMediaRepository extends JpaRepository<PropertyMedia, Long> {
    List<PropertyMedia> findByPropertyId(Long propertyId);
    List<PropertyMedia> findByPropertyIdOrderByDisplayOrder(Long propertyId);
    void deleteByPropertyId(Long propertyId);
}
