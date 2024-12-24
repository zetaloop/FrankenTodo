package build.loop.todo.controller;

import build.loop.todo.model.entity.User;
import build.loop.todo.model.entity.UserSettings;
import build.loop.todo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/user")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.findByUsername(userDetails.getUsername())
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    @PatchMapping("/user/settings")
    public ResponseEntity<UserSettings> updateUserSettings(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody UserSettings settings
    ) {
        User user = userService.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new IllegalStateException("User not found"));
        return ResponseEntity.ok(userService.updateUserSettings(user.getId(), settings));
    }
} 