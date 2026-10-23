plugins {
    id("com.enonic.xp.settings") version "4.2.0"
}

val projectName: String = providers.gradleProperty("projectName").get()
rootProject.name = projectName
