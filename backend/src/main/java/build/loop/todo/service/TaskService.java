package build.loop.todo.service;

import build.loop.todo.model.entity.Task;
import build.loop.todo.model.dto.TaskListResponse;
import build.loop.todo.model.dto.BatchDeleteResponse;

import java.util.List;
import java.util.Optional;

public interface TaskService {
    Task create(String projectId, Task task);
    
    TaskListResponse batchCreate(String projectId, List<Task> tasks);
    
    Optional<Task> findById(String id);
    
    TaskListResponse findAllByProject(String projectId);
    
    Task update(String projectId, String taskId, Task task);
    
    void deleteById(String projectId, String taskId);
    
    BatchDeleteResponse deleteByIds(String projectId, List<String> taskIds);
    
    void updateTaskStatus(String projectId, String taskId, String status);
    
    void updateTaskPriority(String projectId, String taskId, String priority);
    
    void addTaskLabel(String projectId, String taskId, String label);
    
    void removeTaskLabel(String projectId, String taskId, String label);
} 