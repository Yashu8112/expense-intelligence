package com.expenseintelligence.service;
import com.expenseintelligence.dto.ExpenseDto;
import com.expenseintelligence.entity.*;
import com.expenseintelligence.exception.*;
import com.expenseintelligence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Slf4j
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final AiService aiService;

    @Transactional
    public ExpenseDto.Response createExpense(UUID userId, ExpenseDto.CreateRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User","id",userId));
        ExpenseCategory cat = null;
        if (req.getCategoryId() != null)
            cat = categoryRepository.findById(req.getCategoryId()).orElseThrow(() -> new ResourceNotFoundException("Category","id",req.getCategoryId()));
        Expense expense = Expense.builder().user(user).category(cat).title(req.getTitle()).description(req.getDescription())
            .amount(req.getAmount()).currency(req.getCurrency()!=null?req.getCurrency():"USD").expenseDate(req.getExpenseDate())
            .paymentMethod(parsePayment(req.getPaymentMethod())).merchant(req.getMerchant())
            .notes(req.getNotes()).isRecurring(req.isRecurring()).recurringFreq(req.getRecurringFreq()).build();
        expense = expenseRepository.save(expense);
        final UUID eid = expense.getId();
        aiService.categorizeAsync(eid, expense.getTitle(), expense.getDescription(), expense.getMerchant(), expense.getAmount());
        return toResponse(expense);
    }

    @Transactional
    public ExpenseDto.Response updateExpense(UUID userId, UUID expenseId, ExpenseDto.UpdateRequest req) {
        Expense e = expenseRepository.findByIdAndUserId(expenseId, userId).orElseThrow(() -> new ResourceNotFoundException("Expense","id",expenseId));
        if (req.getTitle()!=null) e.setTitle(req.getTitle());
        if (req.getDescription()!=null) e.setDescription(req.getDescription());
        if (req.getAmount()!=null) e.setAmount(req.getAmount());
        if (req.getCurrency()!=null) e.setCurrency(req.getCurrency());
        if (req.getExpenseDate()!=null) e.setExpenseDate(req.getExpenseDate());
        if (req.getMerchant()!=null) e.setMerchant(req.getMerchant());
        if (req.getNotes()!=null) e.setNotes(req.getNotes());
        if (req.getIsRecurring()!=null) e.setRecurring(req.getIsRecurring());
        if (req.getRecurringFreq()!=null) e.setRecurringFreq(req.getRecurringFreq());
        if (req.getPaymentMethod()!=null) e.setPaymentMethod(parsePayment(req.getPaymentMethod()));
        if (req.getCategoryId()!=null) e.setCategory(categoryRepository.findById(req.getCategoryId()).orElseThrow(() -> new ResourceNotFoundException("Category","id",req.getCategoryId())));
        return toResponse(expenseRepository.save(e));
    }

    @Transactional
    public void deleteExpense(UUID userId, UUID expenseId) {
        Expense e = expenseRepository.findByIdAndUserId(expenseId, userId).orElseThrow(() -> new ResourceNotFoundException("Expense","id",expenseId));
        expenseRepository.delete(e);
    }

    @Transactional(readOnly=true)
    public ExpenseDto.Response getExpenseById(UUID userId, UUID expenseId) {
        return toResponse(expenseRepository.findByIdAndUserId(expenseId, userId).orElseThrow(() -> new ResourceNotFoundException("Expense","id",expenseId)));
    }

    @Transactional(readOnly=true)
    public ExpenseDto.PageResponse getExpenses(UUID userId, ExpenseDto.FilterRequest f) {
        Sort sort = "asc".equalsIgnoreCase(f.getSortDir()) ? Sort.by(f.getSortBy()!=null?f.getSortBy():"expenseDate").ascending() : Sort.by(f.getSortBy()!=null?f.getSortBy():"expenseDate").descending();
        Pageable pageable = PageRequest.of(f.getPage(), f.getSize(), sort);
        Page<Expense> page = expenseRepository.findWithFilters(userId, f.getSearch(), f.getCategoryId(), f.getStartDate(), f.getEndDate(), pageable);
        return ExpenseDto.PageResponse.builder().content(page.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
            .page(page.getNumber()).size(page.getSize()).totalElements(page.getTotalElements()).totalPages(page.getTotalPages()).last(page.isLast()).build();
    }

    @Transactional(readOnly=true)
    public ExpenseDto.DashboardStats getDashboardStats(UUID userId) {
        LocalDate now = LocalDate.now();
        LocalDate som = now.withDayOfMonth(1);
        LocalDate solm = som.minusMonths(1);
        LocalDate eolm = som.minusDays(1);
        BigDecimal thisMonth = expenseRepository.sumAmountByUserIdAndDateRange(userId, som, now);
        BigDecimal lastMonth = expenseRepository.sumAmountByUserIdAndDateRange(userId, solm, eolm);
        BigDecimal change = BigDecimal.ZERO;
        if (lastMonth.compareTo(BigDecimal.ZERO) > 0)
            change = thisMonth.subtract(lastMonth).divide(lastMonth,4,RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        List<Object[]> cats = expenseRepository.getCategoryTotals(userId, som, now);
        BigDecimal grand = cats.stream().map(r -> (BigDecimal)r[1]).reduce(BigDecimal.ZERO, BigDecimal::add);
        List<ExpenseDto.CategoryStat> catStats = cats.stream().map(r -> {
            String n = (String)r[0]; BigDecimal t = (BigDecimal)r[1];
            double pct = grand.compareTo(BigDecimal.ZERO)>0 ? t.divide(grand,4,RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0;
            return ExpenseDto.CategoryStat.builder().category(n).total(t).percentage(pct).build();
        }).collect(Collectors.toList());
        List<Object[]> monthly = expenseRepository.getMonthlyTotals(userId, now.minusMonths(5).withDayOfMonth(1));
        List<ExpenseDto.MonthlyStat> trend = monthly.stream().map(r -> {
            int m=((Number)r[0]).intValue(), y=((Number)r[1]).intValue();
            return ExpenseDto.MonthlyStat.builder().month(m).year(y).total((BigDecimal)r[2])
                .label(Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH)+" "+y).build();
        }).collect(Collectors.toList());
        long count = expenseRepository.findByUserIdOrderByExpenseDateDesc(userId, PageRequest.of(0,1)).getTotalElements();
        String highCat = catStats.isEmpty()?"N/A":catStats.get(0).getCategory();
        BigDecimal highAmt = catStats.isEmpty()?BigDecimal.ZERO:catStats.get(0).getTotal();
        return ExpenseDto.DashboardStats.builder().totalThisMonth(thisMonth).totalLastMonth(lastMonth).changePercent(change)
            .highestCategory(highCat).highestCategoryAmount(highAmt).totalExpensesCount(count)
            .averageExpense(count>0?thisMonth.divide(BigDecimal.valueOf(count),2,RoundingMode.HALF_UP):BigDecimal.ZERO)
            .categoryBreakdown(catStats).monthlyTrend(trend).build();
    }

    private Expense.PaymentMethod parsePayment(String m) {
        if (m==null) return Expense.PaymentMethod.CARD;
        try { return Expense.PaymentMethod.valueOf(m.toUpperCase()); } catch (Exception e) { return Expense.PaymentMethod.OTHER; }
    }

    public ExpenseDto.Response toResponse(Expense e) {
        ExpenseDto.CategoryDto cat = e.getCategory()==null ? null : ExpenseDto.CategoryDto.builder()
            .id(e.getCategory().getId()).name(e.getCategory().getName()).icon(e.getCategory().getIcon()).color(e.getCategory().getColor()).build();
        return ExpenseDto.Response.builder().id(e.getId()).title(e.getTitle()).description(e.getDescription())
            .amount(e.getAmount()).currency(e.getCurrency()).expenseDate(e.getExpenseDate()).category(cat)
            .paymentMethod(e.getPaymentMethod()!=null?e.getPaymentMethod().name():null)
            .merchant(e.getMerchant()).aiCategory(e.getAiCategory()).aiConfidence(e.getAiConfidence())
            .aiProcessed(e.isAiProcessed()).notes(e.getNotes()).isRecurring(e.isRecurring())
            .recurringFreq(e.getRecurringFreq()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();
    }
}
