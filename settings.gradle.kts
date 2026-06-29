plugins {
    id("com.enonic.xp.settings") version "4.1.0"
}

val projectName: String by settings
rootProject.name = projectName
