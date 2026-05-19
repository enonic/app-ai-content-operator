import com.github.gradle.node.pnpm.task.PnpmTask

plugins {
    java
    `maven-publish`
    alias(libs.plugins.enonic.defaults)
    alias(libs.plugins.enonic.xp.app)
    alias(libs.plugins.node.gradle)
}

val appName: String by project
val xpVersion: String by project

dependencies {
    include(libs.google.auth.oauth2)
    include(xplibs.auth)
    include(xplibs.websocket)
    include(xplibs.task)
    include(libs.lib.cron)
    include(libs.lib.http.client)
    include(libs.lib.license)
}

repositories {
    mavenLocal()
    mavenCentral()
    xp.enonicRepo()
    xp.enonicRepo("dev")
}

node {
    download = true
    version = "24.15.0"
    pnpmVersion = "11.0.9"
}

app {
    name = appName
    systemVersion = xpVersion
}

fun isProd(): Boolean =
    providers.gradleProperty("env").getOrElse("prod") in setOf("p", "prod", "production")

fun environmentShort(): String = if (isProd()) "prod" else "dev"

fun nodeEnvironment(): String = if (isProd()) "production" else "development"

tasks.register<PnpmTask>("pnpmBuild") {
    dependsOn(tasks.named("pnpmInstall"))
    description = "Build UI assets with Vite and server bundles with esbuild."
    args = listOf("run", "build:${environmentShort()}")
    environment = mapOf(
        "FORCE_COLOR" to "true",
        "NODE_ENV" to nodeEnvironment()
    )
    inputs.dir("src/main/resources")
    outputs.dir(layout.buildDirectory.dir("resources/main"))
    outputs.upToDateWhen { false }
}

tasks.register<PnpmTask>("pnpmCheck") {
    dependsOn(tasks.named("pnpmInstall"))
    description = "Run lint, type-check and tests."
    args = listOf("run", "check")
    environment = mapOf("FORCE_COLOR" to "true")
}

tasks.named("jar") {
    dependsOn(tasks.named("pnpmBuild"))
}

tasks.named("check") {
    dependsOn(tasks.named("pnpmCheck"))
}

tasks.named<ProcessResources>("processResources") {
    exclude("**/*.ts")
    exclude("**/*.tsx")
    exclude("**/tsconfig*.json")
    exclude("**/assets/index.css")
    includeEmptyDirs = false
    mustRunAfter("pnpmBuild")
}
