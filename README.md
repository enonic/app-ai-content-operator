# Juke AI: Content Operator

Content Operator, one of the Enonic Juke AI skills, is crafted to optimize and elevate your daily workflows using cutting-edge Large Language Models. Whether you're looking for assistance with content creation, data analysis, or digital task management, Juke AI offers comprehensive support to enhance your efficiency and productivity.

## Installation

```shell
./gradlew deploy
```

## Configuration

### 1. Google Service Account Key (SAK)

In order to use this application, you need to obtain a Google Service Account Key (SAK) in JSON format and have it accessible in your file system. [Contact us](https://www.enonic.com/company/contact-us) if you need assistance with this step.

### 2. Application Configuration

1. **Create the Configuration File**

    Create a configuration file in the `$XP_HOME/config` directory named `com.enonic.app.ai.contentoperator.cfg`.

2. **Add the Following Properties**

  - `google.api.sak.path`: Path to the Google Service Account Key (SAK) file on your system. Use Unix-style paths or properly escape backslashes.

## Configuration File

`com.enonic.app.ai.contentoperator.cfg (sample)`
```properties
# Path to Google's Service Account Key (a JSON file)
google.api.sak.path=${xp.home}/config/playground-123456-e13cb1841f87.json

# (Optional) (Default: "all") A comma separated list of debug groups to limit the debug output, not enforce it.
# Possible values: all, none, google, func, ws
# Leaving empty or adding "all" to list will log all debug groups.
log.debug.groups=all
```
