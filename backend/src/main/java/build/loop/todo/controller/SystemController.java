package build.loop.todo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.context.ApplicationContext;
import org.springframework.boot.SpringApplication;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/system")
@RequiredArgsConstructor
public class SystemController {
    private final ApplicationContext context;

    @PostMapping("/shutdown")
    public ResponseEntity<Void> shutdown() {
        // 使用新线程来关闭应用，这样可以确保响应能够正常返回
        new Thread(() -> {
            try {
                Thread.sleep(100); // 稍微延迟以确保响应能够返回
                SpringApplication.exit(context, () -> 0);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        return ResponseEntity.ok().build();
    }
} 