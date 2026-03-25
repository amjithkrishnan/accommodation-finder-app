package com.example.serviceapp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "properties")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long propertyId;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String propertyType;

    @Column(nullable = false)
    private String address;

    private String eircode;

    @Column(nullable = false, length = 100)
    private String city;

    private String county;

    private String postalCode;

    private String country = "Ireland";

    @Enumerated(EnumType.STRING)
    private FurnishType furnishType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer bedrooms;

    @Column(nullable = false)
    private Integer bathrooms;

    private Integer sizeSqft;

    private LocalDate availableFrom;

    @Enumerated(EnumType.STRING)
    private LeaseType leaseType = LeaseType.LONG_TERM;

    @Enumerated(EnumType.STRING)
    private ListingStatus listingStatus = ListingStatus.AVAILABLE;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum LeaseType { LONG_TERM, SHORT_TERM }
    public enum ListingStatus { AVAILABLE, RENTED, PENDING, INACTIVE }
    public enum FurnishType { FURNISHED, UNFURNISHED, PART_FURNISHED }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getEircode() { return eircode; }
    public void setEircode(String eircode) { this.eircode = eircode; }
    public String getCounty() { return county; }
    public void setCounty(String county) { this.county = county; }
    public FurnishType getFurnishType() { return furnishType; }
    public void setFurnishType(FurnishType furnishType) { this.furnishType = furnishType; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    public Integer getSizeSqft() { return sizeSqft; }
    public void setSizeSqft(Integer sizeSqft) { this.sizeSqft = sizeSqft; }
    public LocalDate getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDate availableFrom) { this.availableFrom = availableFrom; }
    public LeaseType getLeaseType() { return leaseType; }
    public void setLeaseType(LeaseType leaseType) { this.leaseType = leaseType; }
    public ListingStatus getListingStatus() { return listingStatus; }
    public void setListingStatus(ListingStatus listingStatus) { this.listingStatus = listingStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
