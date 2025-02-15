# Juke AI: Content Operator

Content Operator, the Enonic's Juke AI plugin, is crafted to optimize and elevate your daily workflows using cutting-edge Large Language Models. Whether you're looking for assistance with content creation, data analysis, or digital task management, Juke AI offers comprehensive support to enhance your efficiency and productivity.

## Installation

```shell
./gradlew deploy
```

## Configuration

### 1. Google Service Account Key (SAK)

First, obtain a Google Service Account Key (SAK) to access the Vertex AI API. This key is a JSON file named in the format `%project_name%-%12_digit_number%.json`.

- **If you already have the JSON file**, you can skip this step.
- **Otherwise**, create a new one by following the steps in the [Service Account Key guide](docs/SERVICE_ACCOUNT_KEY.MD).


### 2. Application Configuration

1. **Create the Configuration File**

    Create a configuration file in the `$XP_HOME/config` directory named `com.enonic.app.ai.contentoperator.cfg`.

2. **Add the Following Properties**
  - `google.api.gemini.flash.url`: URL of a model from the Gemini family on Vertex AI. This model is used to analyze the user's request. We recommend using Flash models for fast responses.

  - `google.api.gemini.pro.url`: URL of a model from the Gemini family on Vertex AI. This model is used to generate content, so it should be accurate and creative. We recommend using Pro models for precise responses.

  - `google.api.sak.path`: Path to the Google Service Account Key (SAK) file on your system. Use Unix-style paths or properly escape backslashes.

For a list of available models, visit the [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden). Note that not all models are available in every region; for region-specific availability, refer to [Vertex AI Locations](https://cloud.google.com/vertex-ai/docs/general/locations).

You can find the example of the configuration file below.

> **Note 1:** Currently, we use the same model for both `flash` and `pro` properties because Gemini 2.0 Flash is not yet released, and Gemini 2.0 Flash is currently the best model available.

> **Note 2:** Alternatively, you can use fast reasoning model as `flash` (e.g., Gemini 2.0 Flash Thinking) for better handling of complex requests. However, these models are still in the experimental stage.
>
> Example URL for Gemini 2.0 Flash Thinking:
> `https://us-central1-aiplatform.googleapis.com/v1/projects/playground-186616/locations/us-central1/publishers/google/models/gemini-2.0-flash-thinking-exp-01-21`

## Configuration File

`com.enonic.app.ai.contentoperator.cfg`
```properties
# Gemini Model URL on Google APIs
# `*:generateContent` last part must be dropped, as streaming support handled by the application
#   Flash model (will be used for analyzing request)
google.api.gemini.flash.url=https://europe-west1-aiplatform.googleapis.com/v1/projects/playground-186616/locations/europe-west1/publishers/google/models/gemini-2.0-flash-001
#   Pro model (will be used for generating content)
google.api.gemini.pro.url=https://europe-west1-aiplatform.googleapis.com/v1/projects/playground-186616/locations/europe-west1/publishers/google/models/gemini-2.0-flash-001

# Path to Google's Service Account Key (a JSON file)
google.api.sak.path=/Users/enonic/config/playground-123456-e13cb1841f87.json

# (Optional) (Default: "all") A comma separated list of debug groups to limit the debug output, not enforce it.
# Possible values: all, none, google, func, ws
# Leaving empty or adding "all" to list will log all debug groups.
log.debug.groups=all
```
