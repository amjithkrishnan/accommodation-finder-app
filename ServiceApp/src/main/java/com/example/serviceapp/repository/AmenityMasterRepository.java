package com.example.serviceapp.repository;

import com.example.serviceapp.model.AmenityMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AmenityMasterRepository extends JpaRepository<AmenityMaster, Long> {
    List<AmenityMaster> findByIsActiveTrue();
}
