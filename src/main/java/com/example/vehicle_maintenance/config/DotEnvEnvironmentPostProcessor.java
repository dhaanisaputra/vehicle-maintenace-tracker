package com.example.vehicle_maintenance.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads a local .env file into the Spring Environment so the app can run from
 * both `mvnw spring-boot:run` and `java -jar` without manually exported env vars.
 * System environment variables take precedence over values defined in .env.
 */
public class DotEnvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String ENV_FILE = ".env";
    private static final int ORDER = Ordered.HIGHEST_PRECEDENCE + 10;

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(DotEnvEnvironmentPostProcessor.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path path = Path.of(System.getProperty("user.dir", ".")).resolve(ENV_FILE).toAbsolutePath();
        if (!Files.exists(path)) {
            return;
        }
        try {
            Map<String, Object> props = new HashMap<>();
            List<String> lines = Files.readAllLines(path);
            for (String raw : lines) {
                String line = raw.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }
                int idx = line.indexOf('=');
                String key = line.substring(0, idx).trim();
                String value = line.substring(idx + 1).trim();
                // Strip surrounding quotes if present
                if (value.length() >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                }
                // Do not override variables already present in the OS environment
                if (System.getenv(key) == null) {
                    props.put(key, value);
                }
            }
            if (!props.isEmpty()) {
                environment.getPropertySources()
                        .addFirst(new MapPropertySource("dotenv", props));
                log.info("[dotenv] loaded {} properties from {}", props.size(), path);
            }
        } catch (IOException e) {
            // Non-fatal: app falls back to system env / application.properties defaults
        }
    }

    @Override
    public int getOrder() {
        return ORDER;
    }
}
