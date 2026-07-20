package com.example.vehicle_maintenance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
public class VehicleMaintenanceApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(VehicleMaintenanceApplication.class, args);
	}

	/**
	 * Reads a local .env file (if present) and exposes its entries as JVM system
	 * properties so Spring's ${...} placeholders resolve without manually exported
	 * environment variables. OS environment variables take precedence.
	 */
	private static void loadDotEnv() {
		Path path = Path.of(System.getProperty("user.dir", ".")).resolve(".env").toAbsolutePath();
		if (!Files.exists(path)) {
			return;
		}
		try {
			List<String> lines = Files.readAllLines(path);
			for (String raw : lines) {
				String line = raw.trim();
				if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
					continue;
				}
				int idx = line.indexOf('=');
				String key = line.substring(0, idx).trim();
				String value = line.substring(idx + 1).trim();
				if (value.length() >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
					value = value.substring(1, value.length() - 1);
				}
				if (System.getenv(key) == null && System.getProperty(key) == null) {
					System.setProperty(key, value);
				}
			}
		} catch (IOException ignored) {
			// Non-fatal: application.properties defaults will apply instead.
		}
	}
}
