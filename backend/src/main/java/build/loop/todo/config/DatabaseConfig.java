package build.loop.todo.config;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.jdbc.DataSourceBuilder;
import javax.sql.DataSource;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class DatabaseConfig {

    private Config loadConfig() {
        // 获取应用程序运行目录
        String appDir = System.getProperty("user.dir");
        // 配置文件路径
        Path configPath = Paths.get(appDir, "config.conf");
        
        // 如果在当前目录没找到，尝试在backend子目录查找
        if (!configPath.toFile().exists()) {
            configPath = Paths.get(appDir, "backend", "config.conf");
        }
        
        File configFile = configPath.toFile();
        if (!configFile.exists()) {
            throw new RuntimeException("配置文件 config.conf 不存在！请确保配置文件位于正确位置。");
        }
        return ConfigFactory.parseFile(configFile);
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        Config config = loadConfig();
        Config dbConfig = config.getConfig("database");
        
        return DataSourceBuilder.create()
                .driverClassName(dbConfig.getString("driver"))
                .url(dbConfig.getString("url"))
                .username(dbConfig.getString("username"))
                .password(dbConfig.getString("password"))
                .build();
    }
} 