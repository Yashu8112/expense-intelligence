package com.expenseintelligence.service;
import com.expenseintelligence.dto.AiDto;
import com.expenseintelligence.entity.*;
import com.expenseintelligence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Slf4j
public class AiService {
    private final ChatClient chatClient;
    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final AiInsightRepository insightRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private static final List<String> CATEGORIES = List.of("Food & Dining","Transportation","Shopping","Entertainment","Healthcare","Housing","Travel","Education","Bills & Utilities","Personal Care","Investments","Insurance","Gifts & Donations","Other");

    private String ai(String prompt) {
        return chatClient.call(new Prompt(prompt)).getResult().getOutput().getContent();
    }

    @Async @Transactional
    public void categorizeAsync(UUID expenseId, String title, String description, String merchant, BigDecimal amount) {
        try {
            AiDto.CategorizationResult r = categorize(title, description, merchant, amount);
            expenseRepository.findById(expenseId).ifPresent(e -> {
                e.setAiCategory(r.getSuggestedCategory());
                e.setAiConfidence(BigDecimal.valueOf(r.getConfidence()));
                e.setAiProcessed(true);
                if (r.getConfidence() > 0.8) categoryRepository.findByNameIgnoreCase(r.getSuggestedCategory()).ifPresent(e::setCategory);
                expenseRepository.save(e);
                log.info("Categorized {} as {} ({})", expenseId, r.getSuggestedCategory(), r.getConfidence());
            });
        } catch (Exception ex) { log.error("Categorization failed for {}: {}", expenseId, ex.getMessage()); }
    }

    public AiDto.CategorizationResult categorize(String title, String description, String merchant, BigDecimal amount) {
        String prompt = String.format("Categorize this expense into one of: %s%nTitle: %s, Description: %s, Merchant: %s, Amount: %s%nReturn JSON only: {\"category\":\"<n>\",\"confidence\":<0-1>,\"reasoning\":\"<brief>\"}",
            String.join(", ", CATEGORIES), title, description!=null?description:"N/A", merchant!=null?merchant:"N/A", amount!=null?amount:"N/A");
        try {
            String resp = ai(prompt);
            String cleaned = resp.replaceAll("```json","").replaceAll("```","").trim();
            String cat = field(cleaned,"category"); String conf = field(cleaned,"confidence");
            return AiDto.CategorizationResult.builder().suggestedCategory(cat.isEmpty()?"Other":cat)
                .confidence(conf.isEmpty()?0.5:Double.parseDouble(conf)).reasoning(field(cleaned,"reasoning")).build();
        } catch (Exception e) {
            log.error("AI categorize failed: {}", e.getMessage());
            return AiDto.CategorizationResult.builder().suggestedCategory("Other").confidence(0.5).reasoning("AI unavailable").build();
        }
    }

    @Transactional
    public List<AiDto.InsightResponse> generateInsights(UUID userId) {
        LocalDate end = LocalDate.now(); LocalDate start = end.minusDays(30);
        List<Expense> expenses = expenseRepository.findByUserIdAndDateRange(userId, start, end);
        if (expenses.isEmpty()) return Collections.emptyList();
        String prompt = "Analyze these expenses and give 3-5 insights as JSON array (no markdown). IMPORTANT: always use the Indian Rupee symbol ₹ and INR for all currency values, never use $ or USD:\n" + summary(expenses)
            + "\n[{\"type\":\"SPENDING_PATTERN|BUDGET_REC|ANOMALY|TIP\",\"title\":\"<short>\",\"content\":\"<2-3 sentences>\"}]";
        try {
            User user = userRepository.findById(userId).orElseThrow();
            List<AiInsight> saved = new ArrayList<>();
            for (Map<String,String> d : parseArray(ai(prompt))) {
                saved.add(insightRepository.save(AiInsight.builder().user(user)
                    .insightType(insightType(d.getOrDefault("type","TIP")))
                    .title(d.getOrDefault("title","Insight")).content(d.getOrDefault("content",""))
                    .periodStart(start).periodEnd(end).build()));
            }
            return saved.stream().map(this::toInsight).collect(Collectors.toList());
        } catch (Exception e) { log.error("Insights failed: {}", e.getMessage()); return Collections.emptyList(); }
    }

    public List<AiDto.BudgetRecommendation> getBudgetRecs(UUID userId) {
        List<Expense> expenses = expenseRepository.findByUserIdAndDateRange(userId, LocalDate.now().minusMonths(3), LocalDate.now());
        String prompt = "Budget recommendations as JSON array (no markdown). IMPORTANT: always use the Indian Rupee symbol ₹ and INR for all currency values, never use $ or USD:\n" + summary(expenses)
            + "\n[{\"category\":\"<n>\",\"currentMonthlyAvg\":<num>,\"recommendedBudget\":<num>,\"rationale\":\"<text>\",\"priority\":\"HIGH|MEDIUM|LOW\"}]";
        try {
            List<AiDto.BudgetRecommendation> results = new ArrayList<>();
            for (String block : ai(prompt).replaceAll("```json","").replaceAll("```","").trim().split("\\},\\s*\\{")) {
                String cat = field(block,"category"); if (cat.isEmpty()) continue;
                String avg = field(block,"currentMonthlyAvg"); String rec = field(block,"recommendedBudget");
                try { results.add(AiDto.BudgetRecommendation.builder().category(cat).currentSpending(new BigDecimal(avg.isEmpty()?"0":avg))
                    .recommendedBudget(new BigDecimal(rec.isEmpty()?"0":rec)).rationale(field(block,"rationale")).priority(field(block,"priority")).build());
                } catch (Exception ignored) {}
            }
            return results;
        } catch (Exception e) { log.error("Budget recs failed: {}", e.getMessage()); return Collections.emptyList(); }
    }

    public AiDto.MonthlySummary getMonthlySummary(UUID userId, int month, int year) {
        LocalDate start = LocalDate.of(year,month,1); LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        BigDecimal curr = expenseRepository.sumAmountByUserIdAndDateRange(userId,start,end);
        BigDecimal prev = expenseRepository.sumAmountByUserIdAndDateRange(userId,start.minusMonths(1),start.minusDays(1));
        double pct = prev.compareTo(BigDecimal.ZERO)>0 ? curr.subtract(prev).divide(prev,4,java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0;
        List<Expense> expenses = expenseRepository.findByUserIdAndDateRange(userId,start,end);
        String prompt = String.format("Monthly summary: %d/%d, Total ₹%s, Prev ₹%s, Change %.1f%%%nIMPORTANT: always use the Indian Rupee symbol ₹ and INR for all currency values, never use $ or USD.%n%s%nReturn JSON: {\"narrative\":\"<2-3 sentences>\",\"keyInsights\":[\"a\",\"b\",\"c\"]}",month,year,curr,prev,pct,summary(expenses));
        String narrative = "Summary generated."; List<String> insights = new ArrayList<>();
        try {
            String cleaned = ai(prompt).replaceAll("```json","").replaceAll("```","").trim();
            narrative = field(cleaned,"narrative");
            int s=cleaned.indexOf("["), e=cleaned.lastIndexOf("]");
            if (s>=0&&e>s) { for (String it : cleaned.substring(s+1,e).split("\",\\s*\"")) { String ins=it.replaceAll("[\"\\[\\]]","").trim(); if (!ins.isEmpty()) insights.add(ins); } }
        } catch (Exception e) { log.error("Summary failed: {}", e.getMessage()); }
        List<Object[]> cats = expenseRepository.getCategoryTotals(userId,start,end);
        return AiDto.MonthlySummary.builder().month(month).year(year).totalSpending(curr).previousMonthSpending(prev)
            .changePercent(pct).topCategory(cats.isEmpty()?"N/A":(String)cats.get(0)[0]).keyInsights(insights).aiNarrative(narrative).build();
    }

    @Transactional
    public AiDto.ChatResponse chat(UUID userId, AiDto.ChatRequest request) {
        UUID sessionId = request.getSessionId()!=null?request.getSessionId():UUID.randomUUID();
        User user = userRepository.findById(userId).orElseThrow();
        chatMessageRepository.save(ChatMessage.builder().user(user).sessionId(sessionId).role(ChatMessage.Role.USER).content(request.getMessage()).build());
        List<Expense> recent = expenseRepository.findByUserIdAndDateRange(userId,LocalDate.now().minusDays(30),LocalDate.now());
        List<ChatMessage> history = chatMessageRepository.findByUserIdAndSessionIdOrderByCreatedAtAsc(userId,sessionId);
        StringBuilder conv = new StringBuilder();
        for (int i=Math.max(0,history.size()-10); i<history.size()-1; i++) conv.append(history.get(i).getRole().name()).append(": ").append(history.get(i).getContent()).append("\n");
        String fullPrompt = "You are FinBot, an AI financial assistant. Be concise. IMPORTANT: always use the Indian Rupee symbol ₹ and INR for all currency values, never use $ or USD.\nUser's last 30 days:\n"+summary(recent)+"\nConversation:\n"+conv+"USER: "+request.getMessage()+"\nASSISTANT:";
        String response;
        try { response = ai(fullPrompt); }
        catch (Exception e) { log.error("Chat AI error: {}", e.getMessage()); response = "I'm having trouble right now. Please try again."; }
        chatMessageRepository.save(ChatMessage.builder().user(user).sessionId(sessionId).role(ChatMessage.Role.ASSISTANT).content(response).build());
        return AiDto.ChatResponse.builder().sessionId(sessionId).role("ASSISTANT").content(response).timestamp(LocalDateTime.now()).build();
    }

    @Transactional(readOnly=true)
    public List<AiDto.ChatResponse> getChatHistory(UUID userId, UUID sessionId) {
        return chatMessageRepository.findByUserIdAndSessionIdOrderByCreatedAtAsc(userId,sessionId).stream()
            .map(m -> AiDto.ChatResponse.builder().sessionId(sessionId).role(m.getRole().name()).content(m.getContent()).timestamp(m.getCreatedAt()).build()).collect(Collectors.toList());
    }

    @Transactional(readOnly=true)
    public List<AiDto.InsightResponse> getInsights(UUID userId, int limit) {
        return insightRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0,limit)).stream().map(this::toInsight).collect(Collectors.toList());
    }

    private String summary(List<Expense> expenses) {
        if (expenses.isEmpty()) return "No expenses.";
        BigDecimal total = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO,BigDecimal::add);
        Map<String,BigDecimal> byCat = new LinkedHashMap<>();
        for (Expense e : expenses) { String cat = e.getCategory()!=null?e.getCategory().getName():"Uncategorized"; byCat.merge(cat,e.getAmount(),BigDecimal::add); }
        StringBuilder sb = new StringBuilder("Total: ₹").append(total).append(", Transactions: ").append(expenses.size()).append("\n");
        byCat.entrySet().stream().sorted(Map.Entry.<String,BigDecimal>comparingByValue().reversed()).forEach(e -> sb.append("  ").append(e.getKey()).append(": ₹").append(e.getValue()).append("\n"));
        return sb.toString();
    }
    private String field(String json, String f) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\""+f+"\"\\s*:\\s*\"?([^\"\\},\\]]+)\"?").matcher(json);
        return m.find() ? m.group(1).trim().replace("\"","") : "";
    }
    private List<Map<String,String>> parseArray(String resp) {
        List<Map<String,String>> res = new ArrayList<>();
        String cleaned = resp.replaceAll("```json","").replaceAll("```","").trim();
        for (String block : cleaned.split("\\},\\s*\\{")) {
            Map<String,String> m = new HashMap<>(); m.put("type",field(block,"type")); m.put("title",field(block,"title")); m.put("content",field(block,"content"));
            if (!m.get("title").isEmpty()) res.add(m);
        }
        return res;
    }
    private AiInsight.InsightType insightType(String t) { try { return AiInsight.InsightType.valueOf(t.toUpperCase()); } catch (Exception e) { return AiInsight.InsightType.TIP; } }
    private AiDto.InsightResponse toInsight(AiInsight i) {
        return AiDto.InsightResponse.builder().id(i.getId()).insightType(i.getInsightType().name()).title(i.getTitle()).content(i.getContent())
            .periodStart(i.getPeriodStart()).periodEnd(i.getPeriodEnd()).isRead(i.isRead()).createdAt(i.getCreatedAt()).build();
    }
}