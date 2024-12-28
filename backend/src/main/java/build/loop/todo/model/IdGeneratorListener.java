package build.loop.todo.model;

import build.loop.todo.util.UUIDv7;
import jakarta.persistence.PrePersist;

public class IdGeneratorListener {
    @PrePersist
    public void onPrePersist(Object entity) {
        if (entity instanceof BaseEntity) {
            BaseEntity baseEntity = (BaseEntity) entity;
            if (baseEntity.getId() == null) {
                baseEntity.setId(UUIDv7.generateString());
            }
        }
    }
} 