package build.loop.todo.repository;

import build.loop.todo.model.entity.User;
import build.loop.todo.model.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, String> {
    
    Optional<UserSettings> findByUser(User user);
} 