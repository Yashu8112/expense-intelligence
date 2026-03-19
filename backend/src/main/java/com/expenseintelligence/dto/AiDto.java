package com.expenseintelligence.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public class AiDto {
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InsightResponse {
        private UUID id;
        private String insightType, title, content;
        private LocalDate periodStart, periodEnd;
        private boolean isRead;
        private LocalDateTime createdAt;
    }
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChatRequest {
        private String message;
        private UUID sessionId;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChatResponse {
        private UUID sessionId;
        private String role, content;
        private LocalDateTime timestamp;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BudgetRecommendation {
        private String category, rationale, priority;
        private BigDecimal currentSpending, recommendedBudget;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlySummary {
        private int month, year;
        private BigDecimal totalSpending, previousMonthSpending;
        private double changePercent;
        private String topCategory, aiNarrative;
        private List<String> keyInsights;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategorizationResult {
        private String suggestedCategory, reasoning;
        private double confidence;
    }
}
