package build.loop.todo.service.impl;

import build.loop.todo.model.entity.User;
import build.loop.todo.model.entity.UserSettings;
import build.loop.todo.repository.UserRepository;
import build.loop.todo.repository.UserSettingsRepository;
import build.loop.todo.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User register(User user) {
        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // 创建并保存用户
        User savedUser = userRepository.save(user);
        // 创建默认用户设置
        UserSettings settings = new UserSettings();
        settings.setUser(savedUser);
        userSettingsRepository.save(settings);
        return savedUser;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public User update(User user) {
        return userRepository.save(user);
    }

    @Override
    public void deleteById(String id) {
        userRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSettings getUserSettings(String userId) {
        return userSettingsRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("User settings not found for user: " + userId));
    }

    @Override
    public UserSettings updateUserSettings(String userId, UserSettings settings) {
        UserSettings existingSettings = getUserSettings(userId);
        existingSettings.setTheme(settings.getTheme());
        existingSettings.setLanguage(settings.getLanguage());
        existingSettings.setNotificationsEnabled(settings.isNotificationsEnabled());
        return userSettingsRepository.save(existingSettings);
    }
} 