package build.loop.todo.model.entity;

import build.loop.todo.model.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Data
@EqualsAndHashCode(callSuper = true)
public class Task extends BaseEntity {
    
    @NotBlank
    private String title;

    @Size(max = 500)
    @Column(nullable = true)
    private String description = "";

    @JsonProperty("description")
    public String getDescription() {
        return description == null ? "" : description;
    }

    @JsonIgnore
    public void setDescription(String description) {
        this.description = description == null ? "" : description;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.TODO;

    @JsonProperty("status")
    public String getStatusValue() {
        return status.getValue();
    }

    @JsonIgnore
    public TaskStatus getStatus() {
        return status;
    }

    @JsonProperty("status")
    public void setStatusValue(String value) {
        this.status = TaskStatus.fromValue(value);
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @JsonProperty("priority")
    public String getPriorityValue() {
        return priority.getValue();
    }

    @JsonIgnore
    public TaskPriority getPriority() {
        return priority;
    }

    @JsonProperty("priority")
    public void setPriorityValue(String value) {
        this.priority = TaskPriority.fromValue(value);
    }

    @ElementCollection
    @CollectionTable(name = "task_labels", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "label")
    private List<String> labels = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;
} 