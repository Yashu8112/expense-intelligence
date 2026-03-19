package com.expenseintelligence.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
public class AuthDto {
    @Data public static class SignupRequest {
        @NotBlank @Size(min=2,max=100) private String fullName;
        @NotBlank @Email private String email;
        @NotBlank @Size(min=8,max=100) private String password;
    }
    @Data public static class LoginRequest {
        @NotBlank @Email private String email;
        @NotBlank private String password;
    }
    @Data public static class AuthResponse {
        private String accessToken;
        private String tokenType = "Bearer";
        private long expiresIn;
        private UserDto user;
        public AuthResponse(String accessToken, long expiresIn, UserDto user) {
            this.accessToken = accessToken; this.expiresIn = expiresIn; this.user = user;
        }
    }
    @Data public static class UserDto {
        private String id, email, fullName, avatarUrl, provider, role;
    }
}
