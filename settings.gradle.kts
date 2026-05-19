plugins {
    id("com.enonic.xp.settings") version "4.0.0-B1"
}

val projectName: String by settings
rootProject.name = projectName
