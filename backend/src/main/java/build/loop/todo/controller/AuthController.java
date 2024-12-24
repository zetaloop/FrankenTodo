package build.loop.todo.controller;

import build.loop.todo.model.entity.User;
import build.loop.todo.security.JwtTokenProvider;
import build.loop.todo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        // 检查用户名和邮箱是否已存在
        if (userService.existsByUsername(user.getUsername())) {
            throw new IllegalStateException("Username already exists");
        }
        if (userService.existsByEmail(user.getEmail())) {
            throw new IllegalStateException("Email already exists");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(userService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        // 验证用户凭据
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.get("email"),
                loginRequest.get("password")
            )
        );

        // 设置认证信息
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 生成 JWT 令牌
        String jwt = tokenProvider.generateToken(authentication);

        // 获取用户信息
        User user = userService.findByEmail(loginRequest.get("email"))
            .orElseThrow(() -> new IllegalStateException("User not found"));

        // 构建响应
        Map<String, Object> response = new HashMap<>();
        response.put("access_token", jwt);
        response.put("token_type", "Bearer");
        response.put("expires_in", tokenProvider.getExpirationInSeconds());
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // 清除认证信息
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestHeader("Authorization") String token) {
        // 验证并刷新令牌
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            if (tokenProvider.validateToken(jwt)) {
                String newToken = tokenProvider.refreshToken(jwt);
                
                Map<String, Object> response = new HashMap<>();
                response.put("access_token", newToken);
                response.put("token_type", "Bearer");
                response.put("expires_in", tokenProvider.getExpirationInSeconds());
                
                return ResponseEntity.ok(response);
            }
        }
        
        throw new IllegalArgumentException("Invalid or expired token");
    }
}