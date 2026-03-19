package com.expenseintelligence.controller;
import com.expenseintelligence.dto.*;
import com.expenseintelligence.repository.ExpenseCategoryRepository;
import com.expenseintelligence.security.UserPrincipal;
import com.expenseintelligence.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
@RestController @RequestMapping("/expenses") @RequiredArgsConstructor
public class ExpenseController {
    private final ExpenseService expenseService;
    private final ExpenseCategoryRepository categoryRepository;
    @PostMapping public ResponseEntity<ApiResponse<ExpenseDto.Response>> create(@AuthenticationPrincipal UserPrincipal up, @Valid @RequestBody ExpenseDto.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Expense created",expenseService.createExpense(up.getId(),req)));
    }
    @GetMapping public ResponseEntity<ApiResponse<ExpenseDto.PageResponse>> list(@AuthenticationPrincipal UserPrincipal up,
        @RequestParam(required=false) String search, @RequestParam(required=false) Integer categoryId,
        @RequestParam(required=false) String startDate, @RequestParam(required=false) String endDate,
        @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size,
        @RequestParam(defaultValue="expenseDate") String sortBy, @RequestParam(defaultValue="desc") String sortDir) {
        ExpenseDto.FilterRequest f = ExpenseDto.FilterRequest.builder().search(search).categoryId(categoryId)
            .startDate(startDate!=null?LocalDate.parse(startDate):null).endDate(endDate!=null?LocalDate.parse(endDate):null)
            .page(page).size(size).sortBy(sortBy).sortDir(sortDir).build();
        return ResponseEntity.ok(ApiResponse.success(expenseService.getExpenses(up.getId(),f)));
    }
    @GetMapping("/{id}") public ResponseEntity<ApiResponse<ExpenseDto.Response>> get(@AuthenticationPrincipal UserPrincipal up, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.getExpenseById(up.getId(),id)));
    }
    @PutMapping("/{id}") public ResponseEntity<ApiResponse<ExpenseDto.Response>> update(@AuthenticationPrincipal UserPrincipal up, @PathVariable UUID id, @RequestBody ExpenseDto.UpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Updated",expenseService.updateExpense(up.getId(),id,req)));
    }
    @DeleteMapping("/{id}") public ResponseEntity<ApiResponse<Void>> delete(@AuthenticationPrincipal UserPrincipal up, @PathVariable UUID id) {
        expenseService.deleteExpense(up.getId(),id); return ResponseEntity.ok(ApiResponse.success("Deleted",null));
    }
    @GetMapping("/dashboard/stats") public ResponseEntity<ApiResponse<ExpenseDto.DashboardStats>> stats(@AuthenticationPrincipal UserPrincipal up) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.getDashboardStats(up.getId())));
    }
    @GetMapping("/categories") public ResponseEntity<ApiResponse<?>> categories() {
        return ResponseEntity.ok(ApiResponse.success(categoryRepository.findAll()));
    }
}
