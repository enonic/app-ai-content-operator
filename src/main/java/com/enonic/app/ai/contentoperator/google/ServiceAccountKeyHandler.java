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

import com.google.auth.oauth2.ServiceAccountCredentials;

public class ServiceAccountKeyHandler {

    private static final String CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

    private ServiceAccountCredentials credentials;

    private byte[] checksum;

    public synchronized String getAccessToken(String serviceAccountKeyPath)
            throws IOException {
        updateCredentialsIfNeeded(serviceAccountKeyPath);
        try {
            return credentials.refreshAccessToken().getTokenValue();
        } catch (IOException e) {
            throw new IOException("Failed to refresh Access Token using Service AccountKey.", e);
        }
    }

    public synchronized String getProjectId(String serviceAccountKeyPath)
            throws IOException {
        updateCredentialsIfNeeded(serviceAccountKeyPath);
        return credentials.getProjectId();
    }

    private void updateCredentialsIfNeeded(String serviceAccountKeyPath)
            throws IOException {
        final byte[] currentChecksum = calculateChecksum(Paths.get(serviceAccountKeyPath));

        if (credentials == null || !MessageDigest.isEqual(checksum, currentChecksum)) {
            this.credentials
                    = (ServiceAccountCredentials) loadCredentialsFromFile(serviceAccountKeyPath).createScoped(CLOUD_PLATFORM_SCOPE);
            this.checksum = currentChecksum;
        }
    }

    private ServiceAccountCredentials loadCredentialsFromFile(String serviceAccountKeyPath)
            throws IOException {
        try (FileInputStream fileInputStream = new FileInputStream(serviceAccountKeyPath)) {
            return ServiceAccountCredentials.fromStream(fileInputStream);
        } catch (IOException e) {
            throw new IOException("Failed to load Service Account Key from file: " + serviceAccountKeyPath, e);
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
