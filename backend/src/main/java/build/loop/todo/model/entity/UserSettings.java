package build.loop.todo.model.entity;

import build.loop.todo.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
public class UserSettings extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String theme = "light";

    @Column(name = "notifications_enabled", nullable = false)
    private boolean notificationsEnabled = true;
} 