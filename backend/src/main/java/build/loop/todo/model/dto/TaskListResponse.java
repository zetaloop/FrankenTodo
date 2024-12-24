package build.loop.todo.model.dto;

import build.loop.todo.model.entity.Task;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TaskListResponse {
    private List<Task> tasks;

    public static TaskListResponse of(List<Task> tasks) {
        TaskListResponse response = new TaskListResponse();
        response.setTasks(tasks);
        return response;
    }
} 