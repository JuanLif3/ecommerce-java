package com.bootcamp.ecommerce.security.config;
import com.bootcamp.ecommerce.security.service.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // ! Desactivamos protección CSRF (no se usa en APIs REST puras)
                .authorizeHttpRequests(auth -> auth
                        // ! LA LISTA BLANCA (Rutas Públicas)
                        .requestMatchers("/api/v1/auth/**").permitAll() // Login y Registro
                        .requestMatchers("/api/v1/payments/webhook").permitAll() // Webhook de Transbank

                        // " CUALQUIER OTRA RUTA: EXIGE TOKEN
                        .anyRequest().authenticated()
                )
                // * APIs REST no guardan sesión en memoria, viven del Token en cada petición
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                // * Insertamos nuestro filtro de JWT ANTES del filtro estándar de Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}