package com.example.serviceapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "favorites", uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "propertyId"}))
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long favoriteId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long propertyId;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getFavoriteId() { return favoriteId; }
    public void setFavoriteId(Long favoriteId) { this.favoriteId = favoriteId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
