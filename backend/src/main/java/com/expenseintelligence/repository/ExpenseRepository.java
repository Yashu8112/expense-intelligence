package com.expenseintelligence.repository;
import com.expenseintelligence.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    Page<Expense> findByUserIdOrderByExpenseDateDesc(UUID userId, Pageable pageable);
    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:categoryId IS NULL OR e.category.id = :categoryId) " +
           "AND (:startDate IS NULL OR e.expenseDate >= :startDate) " +
           "AND (:endDate IS NULL OR e.expenseDate <= :endDate) " +
           "ORDER BY e.expenseDate DESC")
    Page<Expense> findWithFilters(@Param("userId") UUID userId, @Param("search") String search, @Param("categoryId") Integer categoryId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);
    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :startDate AND :endDate ORDER BY e.expenseDate DESC")
    List<Expense> findByUserIdAndDateRange(@Param("userId") UUID userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    @Query("SELECT COALESCE(SUM(e.amount),0) FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserIdAndDateRange(@Param("userId") UUID userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    @Query("SELECT e.category.name as category, SUM(e.amount) as total FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :startDate AND :endDate AND e.category IS NOT NULL GROUP BY e.category.name ORDER BY total DESC")
    List<Object[]> getCategoryTotals(@Param("userId") UUID userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    @Query("SELECT EXTRACT(MONTH FROM e.expenseDate) as month, EXTRACT(YEAR FROM e.expenseDate) as year, SUM(e.amount) as total FROM Expense e WHERE e.user.id = :userId AND e.expenseDate >= :startDate GROUP BY month, year ORDER BY year ASC, month ASC")
    List<Object[]> getMonthlyTotals(@Param("userId") UUID userId, @Param("startDate") LocalDate startDate);
    Optional<Expense> findByIdAndUserId(UUID id, UUID userId);
}