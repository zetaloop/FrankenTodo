package build.loop.todo.model.dto;

import build.loop.todo.model.entity.ProjectMember;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProjectMemberListResponse {
    private List<ProjectMember> members;

    public static ProjectMemberListResponse of(List<ProjectMember> members) {
        ProjectMemberListResponse response = new ProjectMemberListResponse();
        response.setMembers(members);
        return response;
    }
} 