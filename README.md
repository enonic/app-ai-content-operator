# Juke AI: Content Operator

Content Operator is the main application for providing access to Enonic's AI universe. It is crafted to optimize and elevate your daily workflows using cutting-edge Large Language Models. Juke AI offers comprehensive support to enhance your efficiency and productivity.

Requires [Enonic License 2.0](LICENSE.txt).

## Building

With the Enonic SDK installed, you may build the application locally

```shell
enonic project deploy
```

## Installation

A pre-buit version of the application can be installed from [Enonic Market](https://market.enonic.com/vendors/enonic/ai-content-operator)

## Requirements

This applications relies on access to the Google Cloud Vertex API which provides a range of different AI models.

> [!NOTE]
> Enonic will provision access to AI services for subscription customers without any additional charge, please get in touch. [Create a support ticket](https://support.enonic.com)

## Configuration

The application authenticates to Google in one of two ways. When `google.api.sak.path` is set, the credentials at that path are used. When it is absent, the application falls back to [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) (ADC).

Whichever you choose, the service account or user needs the role `Vertex AI User (roles/aiplatform.user)`, or a custom role granting `aiplatform.endpoints.predict`. Activate the API in the Google Cloud console first.

### Option 1: Application Default Credentials

Suitable for local development, CI using Workload Identity Federation, and instances running on Google Cloud with an attached service account. No key file is created or distributed.

For local development, leave `google.api.sak.path` unset and run:

```shell
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT=<your project id>
```

ADC resolves credentials from `GOOGLE_APPLICATION_CREDENTIALS`, then the well-known `gcloud` location, then the Google Cloud metadata server. XP inherits these from the environment it is started in, so no application configuration is required.

> [!NOTE]
> If XP runs in a container, credentials written by `gcloud` on the host are not visible inside it. Mount them read-only with `-v ~/.config/gcloud:/root/.config/gcloud:ro`, or point `GOOGLE_APPLICATION_CREDENTIALS` at a mounted path.

### Option 2: Service Account Key

Required when XP runs somewhere that cannot obtain credentials from its environment.

1. **Create Service Account**

   From the Google cloud IAM. Create a service account and grant it the role described above.

2. **Create a Service Account Key (SAK)**

   Using your Service Account, create a new Service Account Key. The key will download automatically to your local machine.

3. **Upload SAK**

   Place it in your `$XP_HOME/config` directory, or a subdirectory

4. **Create an app configuration file**

   Place the file `com.enonic.app.ai.contentoperator.cfg` in your `$XP_HOME/config` directory.
   Add a configuration value `google.api.sak.path : <Path to the Google Service Account Key (SAK) file>` within the config file

   > Use Unix-style paths or properly escape backslashes for windows system

### Google Cloud project

The project is resolved in this order:

1. The `google.api.project.id` configuration value
2. The `project_id` field of a Service Account Key, when one is configured
3. The `GOOGLE_CLOUD_PROJECT` environment variable

A Service Account Key therefore needs no further configuration, while ADC user credentials — which carry no project — require one of the other two. The project is not needed at all when both `google.api.gemini.flash.url` and `google.api.gemini.pro.url` are overridden.

## Example config file

`com.enonic.app.ai.contentoperator.cfg (sample)`

```properties
# (Optional) Path to Google's Service Account Key (a JSON file).
# Leave unset to use Application Default Credentials.
google.api.sak.path=${xp.home}/config/playground-123456-e13cb1841f87.json

# (Optional) Google Cloud project ID.
# Required with Application Default Credentials, unless GOOGLE_CLOUD_PROJECT is set.
google.api.project.id=playground-123456

# (Optional) (Default: "all") A comma separated list of debug groups to limit the debug output, not enforce it.
# Possible values: all, none, google, func, ws
# Leaving empty or adding "all" to list will log all debug groups.
log.debug.groups=all
```
