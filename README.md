# Juke AI: Content Operator

Content Operator, the Enonic's Juke AI plugin, is crafted to optimize and elevate your daily workflows using cutting-edge Large Language Models. Whether you're looking for assistance with content creation, data analysis, or digital task management, Juke AI offers comprehensive support to enhance your efficiency and productivity.

## Installation

```shell
./gradlew deploy
```

## Configuration

`com.enonic.app.ai.contentoperator.cfg`
```properties
# Gemini Model URL on Google APIs
# `*:generateContent` last part must be dropped, as streaming support handled by the application
#   Flash model (will be used for fast responses)
google.api.gemini.flash.url=https://us-central1-aiplatform.googleapis.com/v1/projects/playground-186616/locations/us-central1/publishers/google/models/gemini-1.5-flash-001
#   Pro model (will be used for accurate responses)
google.api.gemini.pro.url=https://us-central1-aiplatform.googleapis.com/v1/projects/playground-186616/locations/us-central1/publishers/google/models/gemini-1.5-pro-001

# Path to Google's Service Account Key (a JSON file)
google.api.sak.path=/Users/enonic/config/playground-186416-e13cb1741f87.json

# (Optional) (Default: "all") A comma separated list of debug groups to limit the debug output.
# Possible values: all, none, openai, rest, node, query, func
# Leaving empty or adding "all" to list will log all debug groups.
log.debug.groups=all
```
