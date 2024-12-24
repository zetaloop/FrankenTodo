package build.loop.todo.service;

import build.loop.todo.model.entity.User;
import build.loop.todo.model.entity.UserSettings;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User register(User user);
    
    Optional<User> findById(String id);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    List<User> findAll();
    
    User update(User user);
    
    void deleteById(String id);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    UserSettings getUserSettings(String userId);
    
    UserSettings updateUserSettings(String userId, UserSettings settings);
} 