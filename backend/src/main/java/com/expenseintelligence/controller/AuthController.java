package com.expenseintelligence.controller;
import com.expenseintelligence.dto.*;
import com.expenseintelligence.security.UserPrincipal;
import com.expenseintelligence.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/signup") public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> signup(@Valid @RequestBody AuthDto.SignupRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Account created",authService.signup(req)));
    }
    @PostMapping("/login") public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Login successful",authService.login(req)));
    }
    @GetMapping("/me") public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> me(@AuthenticationPrincipal UserPrincipal up) {
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser(up)));
    }
}
