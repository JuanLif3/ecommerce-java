package com.bootcamp.ecommerce.customer.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    // El email es crítico: no puede repetirse. Será nuestro identificador principal.
    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    // Absorbemos las columnas de la clase Address hacia esta tabla.
    @Embedded
    private Address address;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, unique = false)
    private LocalDateTime createdAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true) // Llave foránea hacia app_users
    private com.bootcamp.ecommerce.security.domain.model.User user;
}
