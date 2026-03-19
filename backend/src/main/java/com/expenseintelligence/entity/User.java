package com.expenseintelligence.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name="users") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(nullable=false,unique=true) private String email;
    private String password;
    @Column(nullable=false) private String fullName;
    private String avatarUrl;
    @Enumerated(EnumType.STRING) @Column(nullable=false) @Builder.Default private AuthProvider provider = AuthProvider.LOCAL;
    private String providerId;
    @Column(nullable=false) @Builder.Default private String role = "ROLE_USER";
    @Column(nullable=false) @Builder.Default private boolean enabled = true;
    @Column(nullable=false) @Builder.Default private boolean emailVerified = false;
    @CreationTimestamp @Column(nullable=false,updatable=false) private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;
    public enum AuthProvider { LOCAL, GOOGLE, GITHUB }
}
