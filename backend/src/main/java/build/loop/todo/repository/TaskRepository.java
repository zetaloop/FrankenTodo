package build.loop.todo.repository;

import build.loop.todo.model.entity.Project;
import build.loop.todo.model.entity.Task;
import build.loop.todo.model.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    
    List<Task> findAllByProject(Project project);
    
    List<Task> findAllByProjectAndStatus(Project project, TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.project = :project AND t.status IN :statuses")
    List<Task> findAllByProjectAndStatusIn(Project project, Set<TaskStatus> statuses);
    
    @Query("SELECT t FROM Task t JOIN t.labels l WHERE t.project = :project AND l = :label")
    List<Task> findAllByProjectAndLabel(Project project, String label);
    
    long countByProject(Project project);
    
    long countByProjectAndStatus(Project project, TaskStatus status);

    @Modifying
    @Query("DELETE FROM Task t WHERE t.project = :project AND t.id IN :taskIds")
    void deleteByProjectAndIdIn(Project project, Set<String> taskIds);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project = :project AND t.id IN :taskIds")
    long countByProjectAndIdIn(Project project, Set<String> taskIds);
} 