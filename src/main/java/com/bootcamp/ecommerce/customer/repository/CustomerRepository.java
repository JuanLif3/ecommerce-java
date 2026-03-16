package com.bootcamp.ecommerce.customer.repository;

import com.bootcamp.ecommerce.customer.domain.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // * Lo usaremos en el Service para que la Red de Seguridad detenga emails duplicados.
    Optional<Customer> findByEmail(String email);

    // * Para cuando busquemos al cliente al momento de crear una Orden de compra.
    Optional<Customer> findByIdAndIsActiveTrue(Long id);
}
