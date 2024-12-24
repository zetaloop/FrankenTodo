package build.loop.todo.repository;

import build.loop.todo.model.entity.Project;
import build.loop.todo.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    
    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user = :user")
    List<Project> findAllByUser(User user);
    
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Project p " +
           "JOIN p.members m WHERE p.id = :projectId AND m.user.id = :userId")
    boolean isUserMemberOfProject(String projectId, String userId);
    
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Project p " +
           "JOIN p.members m WHERE p.id = :projectId AND m.user.id = :userId AND m.role = 'OWNER'")
    boolean isUserOwnerOfProject(String projectId, String userId);

    @Modifying
    @Query("DELETE FROM Project p WHERE p.id IN :projectIds")
    void deleteByIdIn(Set<String> projectIds);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.id IN :projectIds")
    long countByIdIn(Set<String> projectIds);
} 