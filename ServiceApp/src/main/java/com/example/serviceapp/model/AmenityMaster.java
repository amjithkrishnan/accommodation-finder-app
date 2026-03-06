package com.example.serviceapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "amenity_master")
public class AmenityMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String amenityName;

    @Column(nullable = false)
    private Boolean isActive = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAmenityName() { return amenityName; }
    public void setAmenityName(String amenityName) { this.amenityName = amenityName; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
