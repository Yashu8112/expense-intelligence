package com.expenseintelligence.repository;
import com.expenseintelligence.entity.AiInsight;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, UUID> {
    List<AiInsight> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
