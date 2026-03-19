package com.expenseintelligence.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
@Entity @Table(name="expense_categories") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExpenseCategory {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
    @Column(nullable=false,unique=true) private String name;
    private String icon;
    private String color;
    private String description;
    @CreationTimestamp @Column(nullable=false,updatable=false) private LocalDateTime createdAt;
}
