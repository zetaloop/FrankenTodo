package build.loop.todo.model.dto;

import build.loop.todo.model.entity.Project;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProjectListResponse {
    private List<Project> projects;

    public static ProjectListResponse of(List<Project> projects) {
        ProjectListResponse response = new ProjectListResponse();
        response.setProjects(projects);
        return response;
    }
} 