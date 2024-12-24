package build.loop.todo.service;

import build.loop.todo.model.entity.Project;
import build.loop.todo.model.entity.ProjectMember;
import build.loop.todo.model.entity.User;
import build.loop.todo.model.dto.BatchDeleteResponse;

import java.util.List;
import java.util.Optional;

public interface ProjectService {
    Project create(Project project, User creator);
    
    Optional<Project> findById(String id);
    
    List<Project> findAllByUser(User user);
    
    Project update(Project project);
    
    void deleteById(String id);
    
    BatchDeleteResponse deleteByIds(List<String> ids);
    
    List<ProjectMember> getProjectMembers(String projectId);
    
    ProjectMember addProjectMember(String projectId, String userId, String role);
    
    void removeProjectMember(String projectId, String userId);
    
    List<String> getProjectLabels(String projectId);
    
    void addProjectLabel(String projectId, String label);
    
    void removeProjectLabel(String projectId, String label);
} 