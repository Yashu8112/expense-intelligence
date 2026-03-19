package com.expenseintelligence.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
@Component @Slf4j
public class JwtTokenProvider {
    @Value("${jwt.secret}") private String jwtSecret;
    @Value("${jwt.expiration}") private long jwtExpiration;
    private SecretKey getSigningKey() { return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)); }
    public String generateToken(Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        return generateTokenFromUserId(up.getId(), up.getEmail());
    }
    public String generateTokenFromUserId(UUID userId, String email) {
        Map<String,Object> claims = new HashMap<>();
        claims.put("email", email);
        return Jwts.builder().claims(claims).subject(userId.toString()).issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis()+jwtExpiration)).signWith(getSigningKey()).compact();
    }
    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().getSubject());
    }
    public boolean validateToken(String token) {
        try { Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token); return true; }
        catch (Exception ex) { log.error("JWT error: {}", ex.getMessage()); return false; }
    }
    public long getExpirationMs() { return jwtExpiration; }
}
