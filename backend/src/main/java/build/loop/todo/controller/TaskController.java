package build.loop.todo.controller;

import build.loop.todo.model.entity.Task;
import build.loop.todo.model.dto.TaskListResponse;
import build.loop.todo.model.dto.BatchDeleteResponse;
import build.loop.todo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<TaskListResponse> getAllTasks(@PathVariable String projectId) {
        return ResponseEntity.ok(taskService.findAllByProject(projectId));
    }

    @PostMapping
    public ResponseEntity<Task> createTask(
        @PathVariable String projectId,
        @RequestBody Task task
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(taskService.create(projectId, task));
    }

    @PostMapping("/batch")
    public ResponseEntity<TaskListResponse> batchCreateTasks(
        @PathVariable String projectId,
        @RequestBody Map<String, List<Task>> request
    ) {
        List<Task> tasks = request.get("tasks");
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(taskService.batchCreate(projectId, tasks));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTaskById(
        @PathVariable String projectId,
        @PathVariable String taskId
    ) {
        return taskService.findById(taskId)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new IllegalStateException("Task not found"));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(
        @PathVariable String projectId,
        @PathVariable String taskId,
        @RequestBody Task task
    ) {
        return ResponseEntity.ok(taskService.update(projectId, taskId, task));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
        @PathVariable String projectId,
        @PathVariable String taskId
    ) {
        taskService.deleteById(projectId, taskId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<BatchDeleteResponse> batchDeleteTasks(
        @PathVariable String projectId,
        @RequestBody Map<String, List<String>> request
    ) {
        List<String> taskIds = request.get("task_ids");
        return ResponseEntity.ok(taskService.deleteByIds(projectId, taskIds));
    }
} 