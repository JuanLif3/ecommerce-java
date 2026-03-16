package com.bootcamp.ecommerce.security.config;

import com.bootcamp.ecommerce.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    // * Le enseñamos a Spring cómo buscar a nuestros usuarios en PostgreSQL
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    // * Definimos el algoritmo de encriptación: BCrypt es el estándar mundial.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // * Este es el motor que verifica que la contraseña que tipeó el usuario coincida con la encriptada.
    @Bean
    public AuthenticationProvider authenticationProvider() {
        // ¡LA SOLUCIÓN! Le pasamos el servicio de usuarios directamente en el constructor
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());

        // Y luego le seteamos el encriptador de contraseñas
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    // * El administrador general de la autenticación
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

}
