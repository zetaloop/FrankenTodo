package build.loop.todo.service.impl;

import build.loop.todo.model.entity.Project;
import build.loop.todo.model.entity.Task;
import build.loop.todo.model.entity.TaskPriority;
import build.loop.todo.model.entity.TaskStatus;
import build.loop.todo.model.dto.TaskListResponse;
import build.loop.todo.model.dto.BatchDeleteResponse;
import build.loop.todo.repository.ProjectRepository;
import build.loop.todo.repository.TaskRepository;
import build.loop.todo.service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    @Override
    public Task create(String projectId, Task task) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
            
        task.setProject(project);
        // 设置默认值
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.TODO);
        }
        if (task.getPriority() == null) {
            task.setPriority(TaskPriority.MEDIUM);
        }
        if (task.getDescription() == null || task.getDescription().trim().isEmpty()) {
            task.setDescription("");
        }
        
        // 检查并创建不存在的标签
        if (task.getLabels() != null && !task.getLabels().isEmpty()) {
            for (String label : task.getLabels()) {
                if (!project.getLabels().contains(label)) {
                    project.getLabels().add(label);
                }
            }
            projectRepository.save(project);
        }
        
        return taskRepository.save(task);
    }

    @Override
    public TaskListResponse batchCreate(String projectId, List<Task> tasks) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
            
        // 收集所有需要创建的标签
        List<String> labelsToCreate = new ArrayList<>();
        for (Task task : tasks) {
            if (task.getLabels() != null) {
                for (String label : task.getLabels()) {
                    if (!project.getLabels().contains(label) && !labelsToCreate.contains(label)) {
                        labelsToCreate.add(label);
                    }
                }
            }
        }
        
        // 创建新标签
        if (!labelsToCreate.isEmpty()) {
            project.getLabels().addAll(labelsToCreate);
            projectRepository.save(project);
        }
        
        List<Task> createdTasks = new ArrayList<>();
        for (Task task : tasks) {
            task.setProject(project);
            // 设置默认值
            if (task.getStatus() == null) {
                task.setStatus(TaskStatus.TODO);
            }
            if (task.getPriority() == null) {
                task.setPriority(TaskPriority.MEDIUM);
            }
            if (task.getDescription() == null || task.getDescription().trim().isEmpty()) {
                task.setDescription("");
            }
            createdTasks.add(taskRepository.save(task));
        }
        
        return TaskListResponse.of(createdTasks);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Task> findById(String id) {
        return taskRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskListResponse findAllByProject(String projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
            
        List<Task> tasks = taskRepository.findByProject(project);
        return TaskListResponse.of(tasks);
    }

    @Override
    public Task update(String projectId, String taskId, Task task) {
        Task existingTask = taskRepository.findById(taskId)
            .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
            
        // 验证任务属于指定的项目
        if (!existingTask.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Task does not belong to the specified project");
        }
        
        // 更新任务属性
        existingTask.setTitle(task.getTitle());
        String description = task.getDescription();
        existingTask.setDescription(description == null || description.trim().isEmpty() ? "" : description);
        existingTask.setStatus(task.getStatus());
        existingTask.setPriority(task.getPriority());
        existingTask.setLabels(task.getLabels());
        
        return taskRepository.save(existingTask);
    }

    @Override
    public void deleteById(String projectId, String taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
            
        // 验证任务属于指定的项目
        if (!task.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Task does not belong to the specified project");
        }
        
        taskRepository.delete(task);
    }

    @Override
    public BatchDeleteResponse deleteByIds(String projectId, List<String> taskIds) {
        // 验证项目存在
        projectRepository.findById(projectId)
            .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
            
        List<Task> tasks = taskRepository.findAllById(taskIds);
        
        // 验证所有任务都属于指定的项目
        for (Task task : tasks) {
            if (!task.getProject().getId().equals(projectId)) {
                throw new IllegalArgumentException("Task does not belong to the specified project: " + task.getId());
            }
        }
        
        taskRepository.deleteAll(tasks);
        return BatchDeleteResponse.of(tasks.size());
    }

    @Override
    public void updateTaskStatus(String projectId, String taskId, String status) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
            
        // 验证任务属于指定的项目
        if (!task.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Task does not belong to the specified project");
        }
        
        task.setStatus(TaskStatus.fromValue(status));
        taskRepository.save(task);
    }

    @Override
    public void updateTaskPriority(String projectId, String taskId, String priority) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
            
        // 验证任务属于指定的项目
        if (!task.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Task does not belong to the specified project");
        }
        
        task.setPriority(TaskPriority.fromValue(priority));
        taskRepository.save(task);
    }

    @Override
    public void addTaskLabel(String projectId, String taskId, String label) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
            
        // 验证任务属于指定的项目
        if (!task.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Task does not belong to the specified project");
        }
        
        if (!task.getLabels().contains(label)) {
            task.getLabels().add(label);
            taskRepository.save(task);
        }
    }

    @Override
    public void removeTaskLabel(String projectId, String taskId, String label) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
            
        // 验证任务属于指定的项目
        if (!task.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Task does not belong to the specified project");
        }
        
        if (task.getLabels().remove(label)) {
            taskRepository.save(task);
        }
    }
} 