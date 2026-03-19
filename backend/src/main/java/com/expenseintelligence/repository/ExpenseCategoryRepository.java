package com.expenseintelligence.repository;
import com.expenseintelligence.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Integer> {
    Optional<ExpenseCategory> findByNameIgnoreCase(String name);
}
