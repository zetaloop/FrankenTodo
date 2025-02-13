package build.loop.todo.model.entity;

import build.loop.todo.model.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "project_members")
@Data
@EqualsAndHashCode(callSuper = true)
public class ProjectMember extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @JsonProperty("username")
    public String getUsername() {
        return user.getUsername();
    }

    @JsonProperty("email")
    public String getEmail() {
        return user.getEmail();
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectRole role = ProjectRole.MEMBER;

    @JsonProperty("role")
    public String getRoleValue() {
        return role.getValue();
    }

    @JsonIgnore
    public ProjectRole getRole() {
        return role;
    }
} 