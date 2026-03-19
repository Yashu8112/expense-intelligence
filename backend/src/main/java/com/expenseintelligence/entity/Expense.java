package com.expenseintelligence.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name="expenses") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Expense {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id",nullable=false) private User user;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="category_id") private ExpenseCategory category;
    @Column(nullable=false) private String title;
    @Column(columnDefinition="TEXT") private String description;
    @Column(nullable=false,precision=15,scale=2) private BigDecimal amount;
    @Column(nullable=false,length=3) @Builder.Default private String currency = "USD";
    @Column(nullable=false) private LocalDate expenseDate;
    @Enumerated(EnumType.STRING) @Builder.Default private PaymentMethod paymentMethod = PaymentMethod.CARD;
    private String merchant;
    private String aiCategory;
    private BigDecimal aiConfidence;
    @Column(nullable=false) @Builder.Default private boolean aiProcessed = false;
    @Column(columnDefinition="TEXT") private String notes;
    @Column(nullable=false) @Builder.Default private boolean isRecurring = false;
    private String recurringFreq;
    @CreationTimestamp @Column(nullable=false,updatable=false) private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;
    public enum PaymentMethod { CASH, CARD, UPI, BANK_TRANSFER, OTHER }
}
