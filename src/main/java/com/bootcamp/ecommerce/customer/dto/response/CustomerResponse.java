package com.bootcamp.ecommerce.customer.dto.response;

import com.bootcamp.ecommerce.customer.domain.model.Customer;

public record CustomerResponse(
        Long id,
        String fullName,
        String email,
        String fullAddress
) {
    public static CustomerResponse fromEntity(Customer customer) {
        // * Concatenacion de nombre y apellido
        String fullName = customer.getFirstName() + " " + customer.getLastName();

        // * Extraemos la direccion del obj Embedded y la concatenamos
        String fullAddress = "Sin direccion";
        if(customer.getAddress() != null) {
            fullAddress = customer.getAddress().getStreet() + ", " + customer.getAddress().getCity() + " (" + customer.getAddress().getZipCode() + ")";
        }

        return new CustomerResponse(
                customer.getId(),
                fullName,
                customer.getEmail(),
                fullAddress
        );
    }
}
