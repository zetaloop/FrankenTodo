package build.loop.todo.model.entity;

import build.loop.todo.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "user_settings")
@Data
@EqualsAndHashCode(callSuper = true)
public class UserSettings extends BaseEntity {
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String theme = "light";

    private boolean notificationsEnabled = true;
} 