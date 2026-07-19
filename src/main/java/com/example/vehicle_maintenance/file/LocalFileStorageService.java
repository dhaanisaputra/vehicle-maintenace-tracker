package com.example.vehicle_maintenance.file;

import com.example.vehicle_maintenance.common.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class LocalFileStorageService implements FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    private static final String PUBLIC_PATH_PREFIX = "/files/";

    private final Path uploadRoot;

    public LocalFileStorageService(@Value("${app.file.upload-dir}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(uploadRoot);
            log.info("File upload directory initialized at: {}", uploadRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + uploadRoot, e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        validate(file);

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + (extension != null ? "." + extension : "");
        Path target = uploadRoot.resolve(storedName).normalize();

        if (!target.getParent().equals(uploadRoot)) {
            throw new BusinessException("Invalid file path");
        }

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException("Failed to store file: " + e.getMessage());
        }

        log.info("File stored: {}", storedName);
        return PUBLIC_PATH_PREFIX + storedName;
    }

    @Override
    public void delete(String fileUrl) {
        if (!StringUtils.hasText(fileUrl) || !fileUrl.startsWith(PUBLIC_PATH_PREFIX)) {
            return;
        }
        String fileName = fileUrl.substring(PUBLIC_PATH_PREFIX.length());
        Path target = uploadRoot.resolve(fileName).normalize();

        if (!target.getParent().equals(uploadRoot)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
            log.info("File deleted: {}", fileName);
        } catch (IOException e) {
            log.warn("Failed to delete file {}: {}", fileName, e.getMessage());
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is empty");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException("Only JPEG, PNG, and WebP images are allowed");
        }
    }
}
