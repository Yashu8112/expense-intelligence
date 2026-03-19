package com.expenseintelligence.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public class ExpenseDto {
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank @Size(max=255) private String title;
        private String description;
        @NotNull @DecimalMin("0.01") private BigDecimal amount;
        @Builder.Default private String currency = "USD";
        @NotNull private LocalDate expenseDate;
        private Integer categoryId;
        private String paymentMethod, merchant, notes, recurringFreq;
        private boolean isRecurring;
    }
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateRequest {
        private String title, description, currency, paymentMethod, merchant, notes, recurringFreq;
        private BigDecimal amount;
        private LocalDate expenseDate;
        private Integer categoryId;
        private Boolean isRecurring;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private UUID id;
        private String title, description, currency, paymentMethod, merchant, notes, aiCategory, recurringFreq;
        private BigDecimal amount, aiConfidence;
        private LocalDate expenseDate;
        private CategoryDto category;
        private boolean aiProcessed, isRecurring;
        private LocalDateTime createdAt, updatedAt;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryDto { private Integer id; private String name, icon, color; }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FilterRequest {
        private String search, sortBy, sortDir;
        private Integer categoryId;
        private LocalDate startDate, endDate;
        private BigDecimal minAmount, maxAmount;
        @Builder.Default private int page = 0;
        @Builder.Default private int size = 20;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PageResponse {
        private List<Response> content;
        private int page, size, totalPages;
        private long totalElements;
        private boolean last;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardStats {
        private BigDecimal totalThisMonth, totalLastMonth, changePercent, highestCategoryAmount, averageExpense;
        private String highestCategory;
        private long totalExpensesCount;
        private List<CategoryStat> categoryBreakdown;
        private List<MonthlyStat> monthlyTrend;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryStat { private String category, color; private BigDecimal total; private double percentage; }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyStat { private int month, year; private BigDecimal total; private String label; }
}
