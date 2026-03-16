package com.bootcamp.ecommerce.security.domain.model;

import com.bootcamp.ecommerce.security.domain.model.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "app_users")
public class User implements UserDetails { // ¡NUEVO! Implementamos UserDetails

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // =================================================================================
    // MÉTODOS OBLIGATORIOS DE SPRING SECURITY (UserDetails)
    // =================================================================================

    // 1. Spring necesita saber qué rol tiene el usuario para darle permisos
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    // 2. Spring usa el concepto de "Username", para nosotros será el Email
    @Override
    public String getUsername() {
        return email;
    }

    // 3. Controles de cuenta (Para este proyecto, diremos que la cuenta siempre está activa)
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}