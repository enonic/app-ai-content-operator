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

    // ! Static so the token outlives the per-request bean: each refresh is a round trip to Google
    private static GoogleCredentials credentials;

    private static byte[] checksum;

    public String getAccessToken(String serviceAccountKeyPath)
            throws IOException {
        final GoogleCredentials current = updateCredentialsIfNeeded(serviceAccountKeyPath);
        try {
            current.refreshIfExpired();
            return current.getAccessToken().getTokenValue();
        } catch (IOException e) {
            throw new IOException("Failed to refresh Access Token.", e);
        }
    }

    public String getProjectId(String serviceAccountKeyPath)
            throws IOException {
        final GoogleCredentials current = updateCredentialsIfNeeded(serviceAccountKeyPath);

        final String projectId = readProjectIdFromCredentials(current);
        if (projectId != null && !projectId.isBlank()) {
            return projectId;
        }

        return System.getenv(PROJECT_ID_ENV);
    }

    // ? Only Service Account Key and Compute Engine credentials carry a project; the rest return null
    private static String readProjectIdFromCredentials(GoogleCredentials credentials) {
        try {
            return credentials.getProjectId();
        } catch (RuntimeException e) {
            // ! ComputeEngineCredentials throws NPE on a cause-less IOException; the env fallback must still run
            return null;
        }
    }

    private static synchronized GoogleCredentials updateCredentialsIfNeeded(String serviceAccountKeyPath)
            throws IOException {
        if (serviceAccountKeyPath == null || serviceAccountKeyPath.isBlank()) {
            // ? checksum is null only while credentials come from ADC, so a switch away from a key file reloads
            if (credentials == null || checksum != null) {
                credentials = applyScope(loadApplicationDefaultCredentials());
                checksum = null;
            }
            return credentials;
        }

        final byte[] currentChecksum = calculateChecksum(Paths.get(serviceAccountKeyPath));

        if (credentials == null || !MessageDigest.isEqual(checksum, currentChecksum)) {
            credentials = applyScope(loadCredentialsFromFile(serviceAccountKeyPath));
            checksum = currentChecksum;
        }
        return credentials;
    }

    // ! User credentials carry their scopes in the refresh token and reject scoping
    private static GoogleCredentials applyScope(GoogleCredentials credentials) {
        return credentials.createScopedRequired() ? credentials.createScoped(CLOUD_PLATFORM_SCOPE) : credentials;
    }

    private static GoogleCredentials loadApplicationDefaultCredentials()
            throws IOException {
        try {
            return GoogleCredentials.getApplicationDefault();
        } catch (IOException e) {
            throw new IOException("Failed to load Application Default Credentials.", e);
        }
    }

    private static GoogleCredentials loadCredentialsFromFile(String serviceAccountKeyPath)
            throws IOException {
        try (FileInputStream fileInputStream = new FileInputStream(serviceAccountKeyPath)) {
            return GoogleCredentials.fromStream(fileInputStream);
        } catch (IOException e) {
            throw new IOException("Failed to load credentials from file: " + serviceAccountKeyPath, e);
        }
    }

    private static byte[] calculateChecksum(Path filePath) {
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
