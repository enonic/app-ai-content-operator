package com.enonic.app.ai.contentoperator.google;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import com.google.auth.oauth2.GoogleCredentials;

public class ServiceAccountKeyHandler {

    private static final String CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

    private static final String PROJECT_ID_ENV = "GOOGLE_CLOUD_PROJECT";

    private GoogleCredentials credentials;

    private byte[] checksum;

    public synchronized String getAccessToken(String serviceAccountKeyPath)
            throws IOException {
        updateCredentialsIfNeeded(serviceAccountKeyPath);
        try {
            return credentials.refreshAccessToken().getTokenValue();
        } catch (IOException e) {
            throw new IOException("Failed to refresh Access Token.", e);
        }
    }

    public synchronized String getProjectId(String serviceAccountKeyPath)
            throws IOException {
        updateCredentialsIfNeeded(serviceAccountKeyPath);

        final String projectId = readProjectIdFromCredentials();
        if (projectId != null && !projectId.isBlank()) {
            return projectId;
        }

        return System.getenv(PROJECT_ID_ENV);
    }

    // ? Only Service Account Key and Compute Engine credentials carry a project; the rest return null
    private String readProjectIdFromCredentials() {
        try {
            return credentials.getProjectId();
        } catch (RuntimeException e) {
            // ! ComputeEngineCredentials throws NPE on a cause-less IOException; the env fallback must still run
            return null;
        }
    }

    private void updateCredentialsIfNeeded(String serviceAccountKeyPath)
            throws IOException {
        if (serviceAccountKeyPath == null || serviceAccountKeyPath.isBlank()) {
            // ? checksum is null only while credentials come from ADC, so a switch away from a key file reloads
            if (credentials == null || checksum != null) {
                this.credentials = applyScope(loadApplicationDefaultCredentials());
                this.checksum = null;
            }
            return;
        }

        final byte[] currentChecksum = calculateChecksum(Paths.get(serviceAccountKeyPath));

        if (credentials == null || !MessageDigest.isEqual(checksum, currentChecksum)) {
            this.credentials = applyScope(loadCredentialsFromFile(serviceAccountKeyPath));
            this.checksum = currentChecksum;
        }
    }

    // ! User credentials carry their scopes in the refresh token and reject scoping
    private GoogleCredentials applyScope(GoogleCredentials credentials) {
        return credentials.createScopedRequired() ? credentials.createScoped(CLOUD_PLATFORM_SCOPE) : credentials;
    }

    private GoogleCredentials loadApplicationDefaultCredentials()
            throws IOException {
        try {
            return GoogleCredentials.getApplicationDefault();
        } catch (IOException e) {
            throw new IOException("Failed to load Application Default Credentials.", e);
        }
    }

    private GoogleCredentials loadCredentialsFromFile(String serviceAccountKeyPath)
            throws IOException {
        try (FileInputStream fileInputStream = new FileInputStream(serviceAccountKeyPath)) {
            return GoogleCredentials.fromStream(fileInputStream);
        } catch (IOException e) {
            throw new IOException("Failed to load credentials from file: " + serviceAccountKeyPath, e);
        }
    }

    private byte[] calculateChecksum(Path filePath) {
        try (InputStream fileInputStream = Files.newInputStream(filePath); DigestInputStream digestInputStream = new DigestInputStream(
                fileInputStream, MessageDigest.getInstance("SHA-256"))) {
            byte[] buffer = new byte[8192];
            while (digestInputStream.read(buffer) != -1) {
                // Continue reading to update digest
            }
            return digestInputStream.getMessageDigest().digest();
        } catch (IOException e) {
            throw new RuntimeException("Error computing checksum for file: " + filePath, e);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found.", e);
        }
    }
}
