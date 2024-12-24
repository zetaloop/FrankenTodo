package build.loop.todo.repository;

import build.loop.todo.model.entity.Project;
import build.loop.todo.model.entity.ProjectMember;
import build.loop.todo.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, String> {
    
    List<ProjectMember> findAllByProject(Project project);
    
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    
    boolean existsByProjectAndUser(Project project, User user);
    
    void deleteByProjectAndUser(Project project, User user);
} 