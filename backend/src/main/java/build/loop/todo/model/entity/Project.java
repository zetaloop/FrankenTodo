package build.loop.todo.model.entity;

import build.loop.todo.model.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@Setter
public class Project extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank
    @Size(min = 3, max = 50)
    private String name;

    @Size(max = 500)
    private String description;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProjectMember> members = new ArrayList<>();
} 