package build.loop.todo.service;

import build.loop.todo.config.JwtConfig;
import build.loop.todo.model.entity.User;
import build.loop.todo.security.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {
    private final JwtConfig jwtConfig;

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        claims.put("username", user.getUsername());
        return createToken(claims, user.getEmail(), jwtConfig.getExpiration());
    }

    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        claims.put("username", user.getUsername());
        return createToken(claims, user.getEmail(), jwtConfig.getRefreshExpiration());
    }

    private String createToken(Map<String, Object> claims, String subject, Long expiration) {
        long currentTimeSeconds = Instant.now().getEpochSecond();
        long expirationTimeSeconds = currentTimeSeconds + expiration;

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(Date.from(Instant.ofEpochSecond(currentTimeSeconds)))
                .expiration(Date.from(Instant.ofEpochSecond(expirationTimeSeconds)))
                .signWith(jwtConfig.key())
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(jwtConfig.key())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("Failed to parse JWT token", e);
            throw e;
        }
    }

    private Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            log.error("Failed to check token expiration", e);
            return true;
        }
    }

    public User extractUser(String token) {
        Claims claims = extractAllClaims(token);
        User user = new User();
        user.setId((String) claims.get("id"));
        user.setEmail(claims.getSubject());
        user.setUsername((String) claims.get("username"));
        return user;
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        if (!(userDetails instanceof CustomUserDetails customUserDetails)) {
            return false;
        }
        final String tokenEmail = extractEmail(token);
        return (tokenEmail.equals(customUserDetails.getEmail()) && !isTokenExpired(token));
    }
} 