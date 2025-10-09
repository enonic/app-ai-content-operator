# Juke AI: Content Operator

Content Operator is the main application for providing access to Enonic's AI universe. It is crafted to optimize and elevate your daily workflows using cutting-edge Large Language Models. Juke AI offers comprehensive support to enhance your efficiency and productivity.

## Installation

```shell
enonic project deploy
```

## Requirements

This applications relies on access to the Google Cloud Vertex API which provides a range of different AI models. 

> [!NOTE]
> Enonic will provision access to AI services for subscription customers without any additional charge, please get in touch. [Create a support ticket](https://support.enonic.com)


## Configuration

### Create Google Cloud Service Account

You will need a valid Google Service Account Key (SAK) in JSON format and store it in your XP configuration. 


1. **Activate Vertex API**

    In Google Cloud console. Search for and activate the Google Vertex API

2. **Create Service Account**

    From the Google cloud IAM. Create a service account and make sure it has the role `Vertex AI User (roles/aiplatform.user)` 

3. **Create a Service Account Key (SAK)**

    Using your Service Account, create a new Service Account Key. The key will download automatically to your local machine.


### Configure the application

1. **Upload SAK**

    Place it in your `$XP_HOME/config` directory, or a subdirectory 

2. **Create an app configuration file**

    Place the file `com.enonic.app.ai.contentoperator.cfg` in your `$XP_HOME/config` directory.
    Add a configuration value `google.api.sak.path : <Path to the Google Service Account Key (SAK) file>` within the config file

    > Use Unix-style paths or properly escape backslashes for windows system


## Example config file

`com.enonic.app.ai.contentoperator.cfg (sample)`
```properties
# Path to Google's Service Account Key (a JSON file)
google.api.sak.path=${xp.home}/config/playground-123456-e13cb1841f87.json

# (Optional) (Default: "all") A comma separated list of debug groups to limit the debug output, not enforce it.
# Possible values: all, none, google, func, ws
# Leaving empty or adding "all" to list will log all debug groups.
log.debug.groups=all
```
