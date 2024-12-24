package build.loop.todo.config;

import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Configuration
@Getter
public class JwtConfig {
    @Value("${jwt.secret:your-256-bit-secret}")
    private String secret;

    @Value("${jwt.expiration:3600}")
    private Long expiration;

    @Value("${jwt.refresh-expiration:86400}")
    private Long refreshExpiration;

    @Bean
    public SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
} 