package com.expenseintelligence.controller;
import com.expenseintelligence.report.ReportService;
import com.expenseintelligence.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
@RestController @RequestMapping("/reports") @RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;
    @GetMapping("/pdf") public ResponseEntity<byte[]> pdf(@AuthenticationPrincipal UserPrincipal up,
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"report.pdf\"")
            .contentType(MediaType.APPLICATION_PDF).body(reportService.generatePdfReport(up.getId(),startDate,endDate));
    }
    @GetMapping("/excel") public ResponseEntity<byte[]> excel(@AuthenticationPrincipal UserPrincipal up,
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"report.xlsx\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(reportService.generateExcelReport(up.getId(),startDate,endDate));
    }
}
