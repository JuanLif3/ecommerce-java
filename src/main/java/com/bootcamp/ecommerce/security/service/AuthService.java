package com.bootcamp.ecommerce.security.service;

import com.bootcamp.ecommerce.security.domain.model.Role;
import com.bootcamp.ecommerce.security.domain.model.User;
import com.bootcamp.ecommerce.security.dto.request.LoginRequest;
import com.bootcamp.ecommerce.security.dto.request.RegisterRequest;
import com.bootcamp.ecommerce.security.dto.response.AuthResponse;
import com.bootcamp.ecommerce.security.repository.UserRepository;
import com.bootcamp.ecommerce.customer.repository.CustomerRepository;
import com.bootcamp.ecommerce.customer.domain.model.Customer;
import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // * --- REGISTRAR UN NUEVO USAURIO ---
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // ! No permitir correos duplicados
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password())) // ! ESCRIPTACION ANTES DE GUARDAR
                .role(Role.ROLE_USER)
                .build();
        User savedUser = userRepository.save(user);

        Customer customer = Customer.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email()) // Comparten el mismo email
                .user(savedUser) // Los amarramos en la base de datos
                .createdAt(LocalDateTime.now())
                .build();

        customerRepository.save(customer); // Lo guardamos

        String jwtToken = jwtService.generateToken(savedUser);
        return new AuthResponse(jwtToken, savedUser.getEmail(), savedUser.getRole().name());
    }

    // * --- INICIAR SESIÓN (LOGIN) ---
    public AuthResponse login(LoginRequest request) {

        // ! El AuthenticationManager hace el trabajo sucio.
        // ! Desencripta y compara la clave. Si falla, lanza un error de "Bad Credentials".
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // ! Si llegamos a esta línea, la contraseña era correcta. Buscamos al usuario.
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // ! Generamos su Token JWT
        String jwtToken = jwtService.generateToken(user);

        return new AuthResponse(jwtToken, user.getEmail(), user.getRole().name());
    }
}
