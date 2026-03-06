package com.example.serviceapp.repository;

import com.example.serviceapp.model.PropertyTypeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyTypeMasterRepository extends JpaRepository<PropertyTypeMaster, Long> {
    List<PropertyTypeMaster> findByIsActiveTrue();
}
