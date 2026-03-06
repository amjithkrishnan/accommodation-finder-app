package com.example.serviceapp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @Column(nullable = false)
    private Long propertyId;

    @Column(nullable = false)
    private Long tenantId;

    @Enumerated(EnumType.STRING)
    private BookingStatus bookingStatus = BookingStatus.PENDING;

    @Column(nullable = false)
    private LocalDate moveInDate;

    private Integer leaseDurationMonths;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum BookingStatus { PENDING, APPROVED, REJECTED, CANCELLED }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    public BookingStatus getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(BookingStatus bookingStatus) { this.bookingStatus = bookingStatus; }
    public LocalDate getMoveInDate() { return moveInDate; }
    public void setMoveInDate(LocalDate moveInDate) { this.moveInDate = moveInDate; }
    public Integer getLeaseDurationMonths() { return leaseDurationMonths; }
    public void setLeaseDurationMonths(Integer leaseDurationMonths) { this.leaseDurationMonths = leaseDurationMonths; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
