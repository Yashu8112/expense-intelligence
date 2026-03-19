package com.expenseintelligence.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name="chat_messages") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatMessage {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id",nullable=false) private User user;
    @Column(nullable=false) private UUID sessionId;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
    @Column(nullable=false,columnDefinition="TEXT") private String content;
    @CreationTimestamp @Column(nullable=false,updatable=false) private LocalDateTime createdAt;
    public enum Role { USER, ASSISTANT }
}
