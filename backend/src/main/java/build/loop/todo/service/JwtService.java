package build.loop.todo.service;

import build.loop.todo.config.JwtConfig;
import build.loop.todo.model.entity.User;
import build.loop.todo.security.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {
    private final JwtConfig jwtConfig;
    private final JwtParser jwtParser;

    public JwtService(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
        this.jwtParser = Jwts.parser().setSigningKey(jwtConfig.key()).build();
    }

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
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration * 1000))
                .signWith(jwtConfig.key())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractId(String token) {
        return extractClaim(token, claims -> claims.get("id", String.class));
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
            return jwtParser.parseSignedClaims(token).getPayload();
        } catch (Exception e) {
            log.error("无效的 JWT 令牌: {}", e.getMessage());
            throw new IllegalStateException("Invalid JWT token", e);
        }
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (Exception e) {
            log.error("JWT 令牌验证失败: {}", e.getMessage());
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = extractAllClaims(token);
        User user = new User();
        user.setId(claims.get("id", String.class));
        user.setEmail(claims.getSubject());
        user.setUsername(claims.get("username", String.class));
        
        CustomUserDetails userDetails = new CustomUserDetails(user);
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }
} 