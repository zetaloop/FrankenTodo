package build.loop.todo.model;

import jakarta.persistence.PrePersist;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

public class IdGeneratorListener {
    private static final AtomicLong counter = new AtomicLong(System.currentTimeMillis());
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @PrePersist
    public void onPrePersist(Object entity) {
        if (entity instanceof BaseEntity) {
            BaseEntity baseEntity = (BaseEntity) entity;
            if (baseEntity.getId() == null) {
                String timestamp = LocalDateTime.now().format(formatter);
                long sequence = counter.incrementAndGet();
                baseEntity.setId(timestamp + "-" + sequence);
            }
        }
    }
} 