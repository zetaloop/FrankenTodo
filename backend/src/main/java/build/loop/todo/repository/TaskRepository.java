package build.loop.todo.repository;

import build.loop.todo.model.entity.Project;
import build.loop.todo.model.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByProject(Project project);
    
    void deleteByProject(Project project);
} 