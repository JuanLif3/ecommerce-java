package com.bootcamp.ecommerce.order.repository;

import com.bootcamp.ecommerce.order.domain.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByTransbankToken(String transbankToken);
}
