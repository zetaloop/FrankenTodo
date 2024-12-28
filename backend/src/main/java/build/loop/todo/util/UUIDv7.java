package build.loop.todo.util;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

public class UUIDv7 {
    private static final SecureRandom RANDOM = new SecureRandom();

    public static UUID generate() {
        long timestamp = Instant.now().toEpochMilli();
        
        // 使用时间戳的前48位
        long msb = timestamp << 16;
        // 使用随机数填充剩余位
        msb |= RANDOM.nextInt(0x10000) & 0xFFFFL;
        
        // 生成随机的低64位
        long lsb = RANDOM.nextLong();
        
        // 设置版本（7）和变体位
        msb &= ~0xF000L; // 清除版本位
        msb |= 0x7000L;  // 设置版本为 7
        lsb &= ~0x4000000000000000L; // 清除变体位
        lsb |= 0x8000000000000000L;  // 设置 RFC-4122 变体
        
        return new UUID(msb, lsb);
    }

    public static String generateString() {
        return generate().toString();
    }
} 