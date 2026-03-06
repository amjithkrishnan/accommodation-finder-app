package com.example.serviceapp.repository;

import com.example.serviceapp.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPropertyId(Long propertyId);
    List<Booking> findByTenantId(Long tenantId);
    List<Booking> findByBookingStatus(Booking.BookingStatus bookingStatus);
}
