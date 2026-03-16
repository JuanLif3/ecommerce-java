package com.bootcamp.ecommerce.security.repository;

import com.bootcamp.ecommerce.security.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // * Spring Security necesitará este método para buscar al usuario cuando intente hacer Login
    Optional<User> findByEmail(String email);
}
