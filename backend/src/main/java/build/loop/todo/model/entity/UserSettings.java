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

    private String theme = "light";

    private boolean notificationsEnabled = true;
} 