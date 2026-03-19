package com.expenseintelligence.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name="ai_insights") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AiInsight {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id",nullable=false) private User user;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private InsightType insightType;
    @Column(nullable=false) private String title;
    @Column(nullable=false,columnDefinition="TEXT") private String content;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    @Column(nullable=false) @Builder.Default private boolean isRead = false;
    @CreationTimestamp @Column(nullable=false,updatable=false) private LocalDateTime createdAt;
    public enum InsightType { SPENDING_PATTERN, BUDGET_REC, ANOMALY, SUMMARY, TIP }
}
