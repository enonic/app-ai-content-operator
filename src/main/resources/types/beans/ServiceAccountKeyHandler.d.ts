declare interface ServiceAccountKeyHandler {
  /**
   * Retrieves an access token for the given service account key path.
   * @param serviceAccountKeyPath The path to the service account key file, or `null` to use Application Default Credentials.
   * @returns The access token string.
   * @throws {Error} If there's an issue retrieving the access token.
   */
  getAccessToken(serviceAccountKeyPath: string | null): string;

  /**
   * Retrieves the project ID from the credentials, falling back to the `GOOGLE_CLOUD_PROJECT` environment variable.
   * @param serviceAccountKeyPath The path to the service account key file, or `null` to use Application Default Credentials.
   * @returns The project ID string, or `null` if the credentials carry no project and the environment variable is unset.
   * @throws {Error} If there's an issue retrieving the project ID.
   */
  getProjectId(serviceAccountKeyPath: string | null): string | null;
}

interface XpBeans {
  'com.enonic.app.ai.contentoperator.google.ServiceAccountKeyHandler': ServiceAccountKeyHandler;
}
