package build.loop.todo.controller;

import build.loop.todo.model.entity.Project;
import build.loop.todo.model.entity.ProjectMember;
import build.loop.todo.model.entity.User;
import build.loop.todo.model.dto.ProjectListResponse;
import build.loop.todo.model.dto.ProjectMemberListResponse;
import build.loop.todo.model.dto.LabelListResponse;
import build.loop.todo.model.dto.BatchDeleteResponse;
import build.loop.todo.service.ProjectService;
import build.loop.todo.service.UserService;
import build.loop.todo.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ProjectListResponse> getAllProjects(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(((CustomUserDetails) userDetails).getEmail())
            .orElseThrow(() -> new IllegalStateException("User not found"));
        List<Project> projects = projectService.findAllByUser(user);
        return ResponseEntity.ok(ProjectListResponse.of(projects));
    }

    @PostMapping
    public ResponseEntity<Project> createProject(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody Project project
    ) {
        User user = userService.findByEmail(((CustomUserDetails) userDetails).getEmail())
            .orElseThrow(() -> new IllegalStateException("User not found"));
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(projectService.create(project, user));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<Project> getProjectById(@PathVariable String projectId) {
        return projectService.findById(projectId)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new IllegalStateException("Project not found"));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<Project> updateProject(
        @PathVariable String projectId,
        @RequestBody Project project
    ) {
        project.setId(projectId);
        return ResponseEntity.ok(projectService.update(project));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable String projectId) {
        projectService.deleteById(projectId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<BatchDeleteResponse> batchDeleteProjects(@RequestBody Map<String, List<String>> request) {
        List<String> projectIds = request.get("project_ids");
        return ResponseEntity.ok(projectService.deleteByIds(projectIds));
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<ProjectMemberListResponse> getProjectMembers(@PathVariable String projectId) {
        List<ProjectMember> members = projectService.getProjectMembers(projectId);
        return ResponseEntity.ok(ProjectMemberListResponse.of(members));
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectMember> addProjectMember(
        @PathVariable String projectId,
        @RequestBody Map<String, String> request
    ) {
        String userId = request.get("user_id");
        String role = request.get("role");
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(projectService.addProjectMember(projectId, userId, role));
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<Void> removeProjectMember(
        @PathVariable String projectId,
        @PathVariable String userId
    ) {
        projectService.removeProjectMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{projectId}/labels")
    public ResponseEntity<LabelListResponse> getProjectLabels(@PathVariable String projectId) {
        List<String> labels = projectService.getProjectLabels(projectId);
        return ResponseEntity.ok(LabelListResponse.of(labels));
    }

    @PostMapping("/{projectId}/labels")
    public ResponseEntity<String> addProjectLabel(
        @PathVariable String projectId,
        @RequestBody Map<String, String> request
    ) {
        String label = request.get("label");
        projectService.addProjectLabel(projectId, label);
        return ResponseEntity.status(HttpStatus.CREATED).body(label);
    }

    @DeleteMapping("/{projectId}/labels/{label}")
    public ResponseEntity<Void> removeProjectLabel(
        @PathVariable String projectId,
        @PathVariable String label
    ) {
        projectService.removeProjectLabel(projectId, label);
        return ResponseEntity.noContent().build();
    }
} 