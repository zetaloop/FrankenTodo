package build.loop.todo.service.impl;

import build.loop.todo.model.entity.*;
import build.loop.todo.model.dto.BatchDeleteResponse;
import build.loop.todo.repository.ProjectMemberRepository;
import build.loop.todo.repository.ProjectRepository;
import build.loop.todo.repository.TaskRepository;
import build.loop.todo.repository.UserRepository;
import build.loop.todo.service.ProjectService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Override
    public Project create(Project project, User creator) {
        Project savedProject = projectRepository.save(project);
        
        // 创建项目时自动将创建者添加为所有者
        ProjectMember member = new ProjectMember();
        member.setProject(savedProject);
        member.setUser(creator);
        member.setRole(ProjectRole.OWNER);
        projectMemberRepository.save(member);
        
        return savedProject;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Project> findById(String id) {
        return projectRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Project> findAllByUser(User user) {
        return projectMemberRepository.findByUser(user).stream()
            .map(ProjectMember::getProject)
            .collect(Collectors.toList());
    }

    @Override
    public Project update(Project project) {
        Project existingProject = projectRepository.findById(project.getId())
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + project.getId()));
        
        // 只更新名称和描述
        existingProject.setName(project.getName());
        existingProject.setDescription(project.getDescription());
        
        return projectRepository.save(existingProject);
    }

    @Override
    public void deleteById(String id) {
        // 删除项目时级联删除所有相关数据
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + id));
            
        // 删除所有任务
        taskRepository.deleteByProject(project);
        
        // 删除所有成员关系
        projectMemberRepository.deleteByProject(project);
        
        // 删除项目
        projectRepository.delete(project);
    }

    @Override
    public BatchDeleteResponse deleteByIds(List<String> ids) {
        int count = 0;
        for (String id : ids) {
            try {
                deleteById(id);
                count++;
            } catch (EntityNotFoundException e) {
                // 忽略不存在的项目
            }
        }
        return BatchDeleteResponse.of(count);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectMember> getProjectMembers(String projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
        return projectMemberRepository.findByProject(project);
    }

    @Override
    public ProjectMember addProjectMember(String projectId, String userId, String role) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
            
        // 检查用户是否已经是项目成员
        if (projectMemberRepository.findByProjectAndUser(project, user).isPresent()) {
            throw new IllegalStateException("User is already a member of the project");
        }
        
        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setRole(ProjectRole.fromValue(role));
        return projectMemberRepository.save(member);
    }

    @Override
    public void removeProjectMember(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
            
        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, user)
            .orElseThrow(() -> new EntityNotFoundException("Project member not found"));
            
        // 检查是否是最后一个所有者
        if (member.getRole() == ProjectRole.OWNER) {
            long ownerCount = projectMemberRepository.findByProject(project).stream()
                .filter(m -> m.getRole() == ProjectRole.OWNER)
                .count();
            if (ownerCount <= 1) {
                throw new IllegalStateException("Cannot remove the last owner of the project");
            }
        }
        
        projectMemberRepository.delete(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getProjectLabels(String projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
        return new ArrayList<>(project.getLabels());
    }

    @Override
    public void addProjectLabel(String projectId, String label) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
        if (!project.getLabels().contains(label)) {
            project.getLabels().add(label);
            projectRepository.save(project);
        }
    }

    @Override
    public void removeProjectLabel(String projectId, String label) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
        
        // 从项目中移除标签
        project.getLabels().remove(label);
        projectRepository.save(project);
        
        // 从所有任务中移除该标签
        List<Task> tasks = taskRepository.findByProject(project);
        for (Task task : tasks) {
            if (task.getLabels().remove(label)) {
                taskRepository.save(task);
            }
        }
    }
} 