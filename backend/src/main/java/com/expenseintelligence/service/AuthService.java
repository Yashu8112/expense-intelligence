package com.expenseintelligence.service;
import com.expenseintelligence.dto.AuthDto;
import com.expenseintelligence.entity.User;
import com.expenseintelligence.exception.BadRequestException;
import com.expenseintelligence.repository.UserRepository;
import com.expenseintelligence.security.JwtTokenProvider;
import com.expenseintelligence.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    @Transactional
    public AuthDto.AuthResponse signup(AuthDto.SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) throw new BadRequestException("Email already in use");
        User user = User.builder().fullName(request.getFullName()).email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword())).provider(User.AuthProvider.LOCAL).build();
        user = userRepository.save(user);
        String token = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());
        return buildResponse(token, user);
    }
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);
        String token = tokenProvider.generateToken(auth);
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        User user = userRepository.findById(up.getId()).orElseThrow(() -> new BadRequestException("User not found"));
        return buildResponse(token, user);
    }
    public AuthDto.AuthResponse getCurrentUser(UserPrincipal up) {
        User user = userRepository.findById(up.getId()).orElseThrow(() -> new BadRequestException("User not found"));
        return buildResponse(tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail()), user);
    }
    private AuthDto.AuthResponse buildResponse(String token, User user) {
        AuthDto.UserDto dto = new AuthDto.UserDto();
        dto.setId(user.getId().toString()); dto.setEmail(user.getEmail()); dto.setFullName(user.getFullName());
        dto.setAvatarUrl(user.getAvatarUrl()); dto.setProvider(user.getProvider().name()); dto.setRole(user.getRole());
        return new AuthDto.AuthResponse(token, tokenProvider.getExpirationMs(), dto);
    }
}
