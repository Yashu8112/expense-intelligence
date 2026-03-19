package com.expenseintelligence.controller;
import com.expenseintelligence.dto.*;
import com.expenseintelligence.security.UserPrincipal;
import com.expenseintelligence.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/ai") @RequiredArgsConstructor
public class AiController {
    private final AiService aiService;
    @PostMapping("/insights/generate") public ResponseEntity<ApiResponse<List<AiDto.InsightResponse>>> generate(@AuthenticationPrincipal UserPrincipal up) {
        return ResponseEntity.ok(ApiResponse.success("Generated",aiService.generateInsights(up.getId())));
    }
    @GetMapping("/insights") public ResponseEntity<ApiResponse<List<AiDto.InsightResponse>>> insights(@AuthenticationPrincipal UserPrincipal up, @RequestParam(defaultValue="10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(aiService.getInsights(up.getId(),limit)));
    }
    @GetMapping("/budget-recommendations") public ResponseEntity<ApiResponse<List<AiDto.BudgetRecommendation>>> budget(@AuthenticationPrincipal UserPrincipal up) {
        return ResponseEntity.ok(ApiResponse.success(aiService.getBudgetRecs(up.getId())));
    }
    @GetMapping("/monthly-summary") public ResponseEntity<ApiResponse<AiDto.MonthlySummary>> monthly(@AuthenticationPrincipal UserPrincipal up, @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.success(aiService.getMonthlySummary(up.getId(),month,year)));
    }
    @PostMapping("/chat") public ResponseEntity<ApiResponse<AiDto.ChatResponse>> chat(@AuthenticationPrincipal UserPrincipal up, @RequestBody AiDto.ChatRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiService.chat(up.getId(),request)));
    }
    @GetMapping("/chat/history/{sessionId}") public ResponseEntity<ApiResponse<List<AiDto.ChatResponse>>> history(@AuthenticationPrincipal UserPrincipal up, @PathVariable UUID sessionId) {
        return ResponseEntity.ok(ApiResponse.success(aiService.getChatHistory(up.getId(),sessionId)));
    }
}
