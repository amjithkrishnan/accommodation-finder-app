package com.example.serviceapp.repository;

import com.example.serviceapp.model.County;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CountyRepository extends JpaRepository<County, String> {
}
