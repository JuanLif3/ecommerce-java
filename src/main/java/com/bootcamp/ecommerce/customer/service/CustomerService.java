package com.bootcamp.ecommerce.customer.service;

import com.bootcamp.ecommerce.customer.domain.model.Address;
import com.bootcamp.ecommerce.customer.domain.model.Customer;
import com.bootcamp.ecommerce.customer.dto.request.CustomerCreateRequest;
import com.bootcamp.ecommerce.customer.dto.response.CustomerResponse;
import com.bootcamp.ecommerce.customer.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.ContextRestartedEvent;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public CustomerResponse createCustomer(CustomerCreateRequest request) {

        // * Validar que el email exista
        if(customerRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado" + request.email());
        }

        // * Construir el Objetivo de valor (La direccion)
        Address address = Address.builder()
                .street(request.street())
                .city(request.city())
                .zipCode(request.zipCode())
                .build();

        // * Construir la entidad (EL cliente) inyectandole la direccion
        Customer customer = Customer.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .phone(request.phone())
                .address(address)
                .createdAt(LocalDateTime.now())
                .build();

        return CustomerResponse.fromEntity(customerRepository.save(customer));
    }
}
