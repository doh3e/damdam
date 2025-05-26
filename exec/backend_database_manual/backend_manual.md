# Back-end

## IDE / Framework

`IntelliJ IDEA 2024.3.2.1`<br>
`Spring Boot 3.4.5`

## JVM

`Open JDK 21 (Java 21)` 


## 의존성

`Build 도구 : Gradle 8.13`

<details>
<summary>의존성 목록 토글</summary>
<div markdown="1">

```java
+--- org.projectlombok:lombok -> 1.18.38
+--- com.querydsl:querydsl-apt:5.0.0
|    \--- com.querydsl:querydsl-codegen:5.0.0 -> 5.1.0
|         +--- com.querydsl:querydsl-core:5.1.0
|         |    \--- com.mysema.commons:mysema-commons-lang:0.2.4
|         +--- com.querydsl:codegen-utils:5.1.0
|         |    +--- org.eclipse.jdt:ecj:3.26.0
|         |    \--- io.github.classgraph:classgraph:4.8.146
|         +--- javax.inject:javax.inject:1
|         \--- io.github.classgraph:classgraph:4.8.146
+--- jakarta.annotation:jakarta.annotation-api -> 2.1.1
+--- jakarta.persistence:jakarta.persistence-api -> 3.1.0
+--- org.springframework.boot:spring-boot-starter -> 3.4.5
|    +--- org.springframework.boot:spring-boot:3.4.5
|    |    +--- org.springframework:spring-core:6.2.6
|    |    |    \--- org.springframework:spring-jcl:6.2.6
|    |    \--- org.springframework:spring-context:6.2.6
|    |         +--- org.springframework:spring-aop:6.2.6
|    |         |    +--- org.springframework:spring-beans:6.2.6
|    |         |    |    \--- org.springframework:spring-core:6.2.6 (*)
|    |         |    \--- org.springframework:spring-core:6.2.6 (*)
|    |         +--- org.springframework:spring-beans:6.2.6 (*)
|    |         +--- org.springframework:spring-core:6.2.6 (*)
|    |         +--- org.springframework:spring-expression:6.2.6
|    |         |    \--- org.springframework:spring-core:6.2.6 (*)
|    |         \--- io.micrometer:micrometer-observation:1.14.5 -> 1.14.6
|    |              \--- io.micrometer:micrometer-commons:1.14.6
|    +--- org.springframework.boot:spring-boot-autoconfigure:3.4.5
|    |    \--- org.springframework.boot:spring-boot:3.4.5 (*)
|    +--- org.springframework.boot:spring-boot-starter-logging:3.4.5
|    |    +--- ch.qos.logback:logback-classic:1.5.18
|    |    |    +--- ch.qos.logback:logback-core:1.5.18
|    |    |    \--- org.slf4j:slf4j-api:2.0.17
|    |    +--- org.apache.logging.log4j:log4j-to-slf4j:2.24.3
|    |    |    +--- org.apache.logging.log4j:log4j-api:2.24.3
|    |    |    \--- org.slf4j:slf4j-api:2.0.16 -> 2.0.17
|    |    \--- org.slf4j:jul-to-slf4j:2.0.17
|    |         \--- org.slf4j:slf4j-api:2.0.17
|    +--- jakarta.annotation:jakarta.annotation-api:2.1.1
|    +--- org.springframework:spring-core:6.2.6 (*)
|    \--- org.yaml:snakeyaml:2.3
+--- org.springframework.boot:spring-boot-starter-validation -> 3.4.5
|    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    +--- org.apache.tomcat.embed:tomcat-embed-el:10.1.40
|    \--- org.hibernate.validator:hibernate-validator:8.0.2.Final
|         +--- jakarta.validation:jakarta.validation-api:3.0.2
|         +--- org.jboss.logging:jboss-logging:3.4.3.Final -> 3.6.1.Final
|         \--- com.fasterxml:classmate:1.5.1 -> 1.7.0
+--- io.jsonwebtoken:jjwt-api:0.12.3
+--- io.jsonwebtoken:jjwt-impl:0.12.3
|    \--- io.jsonwebtoken:jjwt-api:0.12.3
+--- io.jsonwebtoken:jjwt-jackson:0.12.3
|    +--- io.jsonwebtoken:jjwt-api:0.12.3
|    \--- com.fasterxml.jackson.core:jackson-databind:2.12.7.1 -> 2.18.3
|         +--- com.fasterxml.jackson.core:jackson-annotations:2.18.3
|         |    \--- com.fasterxml.jackson:jackson-bom:2.18.3
|         |         +--- com.fasterxml.jackson.core:jackson-annotations:2.18.3 (c)
|         |         +--- com.fasterxml.jackson.core:jackson-core:2.18.3 (c)
|         |         +--- com.fasterxml.jackson.core:jackson-databind:2.18.3 (c)
|         |         +--- com.fasterxml.jackson.datatype:jackson-datatype-jdk8:2.18.3 (c)
|         |         +--- com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.18.3 (c)
|         |         +--- com.fasterxml.jackson.module:jackson-module-parameter-names:2.18.3 (c)
|         |         \--- com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:2.18.3 (c)
|         +--- com.fasterxml.jackson.core:jackson-core:2.18.3
|         |    \--- com.fasterxml.jackson:jackson-bom:2.18.3 (*)
|         \--- com.fasterxml.jackson:jackson-bom:2.18.3 (*)
+--- org.springframework.boot:spring-boot-starter-security -> 3.4.5
|    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    +--- org.springframework:spring-aop:6.2.6 (*)
|    +--- org.springframework.security:spring-security-config:6.4.5
|    |    +--- org.springframework.security:spring-security-core:6.4.5
|    |    |    +--- org.springframework.security:spring-security-crypto:6.4.5
|    |    |    +--- org.springframework:spring-aop:6.2.6 (*)
|    |    |    +--- org.springframework:spring-beans:6.2.6 (*)
|    |    |    +--- org.springframework:spring-context:6.2.6 (*)
|    |    |    +--- org.springframework:spring-core:6.2.6 (*)
|    |    |    +--- org.springframework:spring-expression:6.2.6 (*)
|    |    |    \--- io.micrometer:micrometer-observation:1.14.6 (*)
|    |    +--- org.springframework:spring-aop:6.2.6 (*)
|    |    +--- org.springframework:spring-beans:6.2.6 (*)
|    |    +--- org.springframework:spring-context:6.2.6 (*)
|    |    \--- org.springframework:spring-core:6.2.6 (*)
|    \--- org.springframework.security:spring-security-web:6.4.5
|         +--- org.springframework.security:spring-security-core:6.4.5 (*)
|         +--- org.springframework:spring-core:6.2.6 (*)
|         +--- org.springframework:spring-aop:6.2.6 (*)
|         +--- org.springframework:spring-beans:6.2.6 (*)
|         +--- org.springframework:spring-context:6.2.6 (*)
|         +--- org.springframework:spring-expression:6.2.6 (*)
|         \--- org.springframework:spring-web:6.2.6
|              +--- org.springframework:spring-beans:6.2.6 (*)
|              +--- org.springframework:spring-core:6.2.6 (*)
|              \--- io.micrometer:micrometer-observation:1.14.5 -> 1.14.6 (*)
+--- org.springframework.boot:spring-boot-starter-oauth2-client -> 3.4.5
|    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    +--- org.springframework.security:spring-security-config:6.4.5 (*)
|    +--- org.springframework.security:spring-security-core:6.4.5 (*)
|    +--- org.springframework.security:spring-security-oauth2-client:6.4.5
|    |    +--- org.springframework.security:spring-security-core:6.4.5 (*)
|    |    +--- org.springframework.security:spring-security-oauth2-core:6.4.5
|    |    |    +--- org.springframework.security:spring-security-core:6.4.5 (*)
|    |    |    +--- org.springframework:spring-core:6.2.6 (*)
|    |    |    \--- org.springframework:spring-web:6.2.6 (*)
|    |    +--- org.springframework.security:spring-security-web:6.4.5 (*)
|    |    +--- org.springframework:spring-core:6.2.6 (*)
|    |    \--- com.nimbusds:oauth2-oidc-sdk:9.43.6
|    |         +--- com.github.stephenc.jcip:jcip-annotations:1.0-1
|    |         +--- com.nimbusds:content-type:2.2
|    |         +--- net.minidev:json-smart:2.5.2
|    |         |    \--- net.minidev:accessors-smart:2.5.2
|    |         |         \--- org.ow2.asm:asm:9.7.1
|    |         +--- com.nimbusds:lang-tag:1.7
|    |         \--- com.nimbusds:nimbus-jose-jwt:9.37.3
|    |              \--- com.github.stephenc.jcip:jcip-annotations:1.0-1
|    \--- org.springframework.security:spring-security-oauth2-jose:6.4.5
|         +--- org.springframework.security:spring-security-core:6.4.5 (*)
|         +--- org.springframework.security:spring-security-oauth2-core:6.4.5 (*)
|         +--- org.springframework:spring-core:6.2.6 (*)
|         \--- com.nimbusds:nimbus-jose-jwt:9.37.3 (*)
+--- org.springframework.boot:spring-boot-starter-websocket -> 3.4.5
|    +--- org.springframework.boot:spring-boot-starter-web:3.4.5
|    |    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    |    +--- org.springframework.boot:spring-boot-starter-json:3.4.5
|    |    |    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    |    |    +--- org.springframework:spring-web:6.2.6 (*)
|    |    |    +--- com.fasterxml.jackson.core:jackson-databind:2.18.3 (*)
|    |    |    +--- com.fasterxml.jackson.datatype:jackson-datatype-jdk8:2.18.3
|    |    |    |    +--- com.fasterxml.jackson.core:jackson-core:2.18.3 (*)
|    |    |    |    +--- com.fasterxml.jackson.core:jackson-databind:2.18.3 (*)
|    |    |    |    \--- com.fasterxml.jackson:jackson-bom:2.18.3 (*)
|    |    |    +--- com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.18.3
|    |    |    |    +--- com.fasterxml.jackson.core:jackson-annotations:2.18.3 (*)
|    |    |    |    +--- com.fasterxml.jackson.core:jackson-core:2.18.3 (*)
|    |    |    |    +--- com.fasterxml.jackson.core:jackson-databind:2.18.3 (*)
|    |    |    |    \--- com.fasterxml.jackson:jackson-bom:2.18.3 (*)
|    |    |    \--- com.fasterxml.jackson.module:jackson-module-parameter-names:2.18.3
|    |    |         +--- com.fasterxml.jackson.core:jackson-core:2.18.3 (*)
|    |    |         +--- com.fasterxml.jackson.core:jackson-databind:2.18.3 (*)
|    |    |         \--- com.fasterxml.jackson:jackson-bom:2.18.3 (*)
|    |    +--- org.springframework.boot:spring-boot-starter-tomcat:3.4.5
|    |    |    +--- jakarta.annotation:jakarta.annotation-api:2.1.1
|    |    |    +--- org.apache.tomcat.embed:tomcat-embed-core:10.1.40
|    |    |    +--- org.apache.tomcat.embed:tomcat-embed-el:10.1.40
|    |    |    \--- org.apache.tomcat.embed:tomcat-embed-websocket:10.1.40
|    |    |         \--- org.apache.tomcat.embed:tomcat-embed-core:10.1.40
|    |    +--- org.springframework:spring-web:6.2.6 (*)
|    |    \--- org.springframework:spring-webmvc:6.2.6
|    |         +--- org.springframework:spring-aop:6.2.6 (*)
|    |         +--- org.springframework:spring-beans:6.2.6 (*)
|    |         +--- org.springframework:spring-context:6.2.6 (*)
|    |         +--- org.springframework:spring-core:6.2.6 (*)
|    |         +--- org.springframework:spring-expression:6.2.6 (*)
|    |         \--- org.springframework:spring-web:6.2.6 (*)
|    +--- org.springframework:spring-messaging:6.2.6
|    |    +--- org.springframework:spring-beans:6.2.6 (*)
|    |    \--- org.springframework:spring-core:6.2.6 (*)
|    \--- org.springframework:spring-websocket:6.2.6
|         +--- org.springframework:spring-context:6.2.6 (*)
|         +--- org.springframework:spring-core:6.2.6 (*)
|         \--- org.springframework:spring-web:6.2.6 (*)
+--- org.springframework.boot:spring-boot-starter-data-redis -> 3.4.5
|    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    +--- io.lettuce:lettuce-core:6.4.2.RELEASE
|    |    +--- io.netty:netty-common:4.1.107.Final -> 4.1.119.Final
|    |    +--- io.netty:netty-handler:4.1.107.Final -> 4.1.119.Final
|    |    |    +--- io.netty:netty-common:4.1.119.Final
|    |    |    +--- io.netty:netty-resolver:4.1.119.Final
|    |    |    |    \--- io.netty:netty-common:4.1.119.Final
|    |    |    +--- io.netty:netty-buffer:4.1.119.Final
|    |    |    |    \--- io.netty:netty-common:4.1.119.Final
|    |    |    +--- io.netty:netty-transport:4.1.119.Final
|    |    |    |    +--- io.netty:netty-common:4.1.119.Final
|    |    |    |    +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |    |    |    \--- io.netty:netty-resolver:4.1.119.Final (*)
|    |    |    +--- io.netty:netty-transport-native-unix-common:4.1.119.Final
|    |    |    |    +--- io.netty:netty-common:4.1.119.Final
|    |    |    |    +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |    |    |    \--- io.netty:netty-transport:4.1.119.Final (*)
|    |    |    \--- io.netty:netty-codec:4.1.119.Final
|    |    |         +--- io.netty:netty-common:4.1.119.Final
|    |    |         +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |    |         \--- io.netty:netty-transport:4.1.119.Final (*)
|    |    +--- io.netty:netty-transport:4.1.107.Final -> 4.1.119.Final (*)
|    |    \--- io.projectreactor:reactor-core:3.6.6 -> 3.7.5
|    |         \--- org.reactivestreams:reactive-streams:1.0.4
|    \--- org.springframework.data:spring-data-redis:3.4.5
|         +--- org.springframework.data:spring-data-keyvalue:3.4.5
|         |    +--- org.springframework.data:spring-data-commons:3.4.5
|         |    |    +--- org.springframework:spring-core:6.2.6 (*)
|         |    |    +--- org.springframework:spring-beans:6.2.6 (*)
|         |    |    \--- org.slf4j:slf4j-api:2.0.2 -> 2.0.17
|         |    +--- org.springframework:spring-context:6.2.6 (*)
|         |    +--- org.springframework:spring-tx:6.2.6
|         |    |    +--- org.springframework:spring-beans:6.2.6 (*)
|         |    |    \--- org.springframework:spring-core:6.2.6 (*)
|         |    \--- org.slf4j:slf4j-api:2.0.2 -> 2.0.17
|         +--- org.springframework:spring-tx:6.2.6 (*)
|         +--- org.springframework:spring-oxm:6.2.6
|         |    +--- org.springframework:spring-beans:6.2.6 (*)
|         |    \--- org.springframework:spring-core:6.2.6 (*)
|         +--- org.springframework:spring-aop:6.2.6 (*)
|         +--- org.springframework:spring-context-support:6.2.6
|         |    +--- org.springframework:spring-beans:6.2.6 (*)
|         |    +--- org.springframework:spring-context:6.2.6 (*)
|         |    \--- org.springframework:spring-core:6.2.6 (*)
|         \--- org.slf4j:slf4j-api:2.0.2 -> 2.0.17
+--- org.springframework.boot:spring-boot-starter-data-jpa -> 3.4.5
|    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    +--- org.springframework.boot:spring-boot-starter-jdbc:3.4.5
|    |    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    |    +--- com.zaxxer:HikariCP:5.1.0
|    |    |    \--- org.slf4j:slf4j-api:1.7.36 -> 2.0.17
|    |    \--- org.springframework:spring-jdbc:6.2.6
|    |         +--- org.springframework:spring-beans:6.2.6 (*)
|    |         +--- org.springframework:spring-core:6.2.6 (*)
|    |         \--- org.springframework:spring-tx:6.2.6 (*)
|    +--- org.hibernate.orm:hibernate-core:6.6.13.Final
|    |    +--- jakarta.persistence:jakarta.persistence-api:3.1.0
|    |    \--- jakarta.transaction:jakarta.transaction-api:2.0.1
|    +--- org.springframework.data:spring-data-jpa:3.4.5
|    |    +--- org.springframework.data:spring-data-commons:3.4.5 (*)
|    |    +--- org.springframework:spring-orm:6.2.6
|    |    |    +--- org.springframework:spring-beans:6.2.6 (*)
|    |    |    +--- org.springframework:spring-core:6.2.6 (*)
|    |    |    +--- org.springframework:spring-jdbc:6.2.6 (*)
|    |    |    \--- org.springframework:spring-tx:6.2.6 (*)
|    |    +--- org.springframework:spring-context:6.2.6 (*)
|    |    +--- org.springframework:spring-aop:6.2.6 (*)
|    |    +--- org.springframework:spring-tx:6.2.6 (*)
|    |    +--- org.springframework:spring-beans:6.2.6 (*)
|    |    +--- org.springframework:spring-core:6.2.6 (*)
|    |    +--- org.antlr:antlr4-runtime:4.13.0
|    |    +--- jakarta.annotation:jakarta.annotation-api:2.0.0 -> 2.1.1
|    |    \--- org.slf4j:slf4j-api:2.0.2 -> 2.0.17
|    \--- org.springframework:spring-aspects:6.2.6
|         \--- org.aspectj:aspectjweaver:1.9.22.1 -> 1.9.24
+--- org.springframework.boot:spring-boot-starter-mail:3.4.5
|    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    +--- org.springframework:spring-context-support:6.2.6 (*)
|    \--- org.eclipse.angus:jakarta.mail:2.0.3
|         \--- jakarta.activation:jakarta.activation-api:2.1.3
+--- com.querydsl:querydsl-jpa:5.0.0
|    \--- com.querydsl:querydsl-core:5.0.0 -> 5.1.0 (*)
+--- org.springframework.boot:spring-boot-starter-webflux -> 3.4.5
|    +--- org.springframework.boot:spring-boot-starter:3.4.5 (*)
|    +--- org.springframework.boot:spring-boot-starter-json:3.4.5 (*)
|    +--- org.springframework.boot:spring-boot-starter-reactor-netty:3.4.5
|    |    \--- io.projectreactor.netty:reactor-netty-http:1.2.5
|    |         +--- io.netty:netty-codec-http:4.1.119.Final
|    |         |    +--- io.netty:netty-common:4.1.119.Final
|    |         |    +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-transport:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-codec:4.1.119.Final (*)
|    |         |    \--- io.netty:netty-handler:4.1.119.Final (*)
|    |         +--- io.netty:netty-codec-http2:4.1.119.Final
|    |         |    +--- io.netty:netty-common:4.1.119.Final
|    |         |    +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-transport:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-codec:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-handler:4.1.119.Final (*)
|    |         |    \--- io.netty:netty-codec-http:4.1.119.Final (*)
|    |         +--- io.netty:netty-resolver-dns:4.1.119.Final
|    |         |    +--- io.netty:netty-common:4.1.119.Final
|    |         |    +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-resolver:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-transport:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-codec:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-codec-dns:4.1.119.Final
|    |         |    |    +--- io.netty:netty-common:4.1.119.Final
|    |         |    |    +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |         |    |    +--- io.netty:netty-transport:4.1.119.Final (*)
|    |         |    |    \--- io.netty:netty-codec:4.1.119.Final (*)
|    |         |    \--- io.netty:netty-handler:4.1.119.Final (*)
|    |         +--- io.netty:netty-resolver-dns-native-macos:4.1.119.Final
|    |         |    \--- io.netty:netty-resolver-dns-classes-macos:4.1.119.Final
|    |         |         +--- io.netty:netty-common:4.1.119.Final
|    |         |         +--- io.netty:netty-resolver-dns:4.1.119.Final (*)
|    |         |         \--- io.netty:netty-transport-native-unix-common:4.1.119.Final (*)
|    |         +--- io.netty:netty-transport-native-epoll:4.1.119.Final
|    |         |    +--- io.netty:netty-common:4.1.119.Final
|    |         |    +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-transport:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-transport-native-unix-common:4.1.119.Final (*)
|    |         |    \--- io.netty:netty-transport-classes-epoll:4.1.119.Final
|    |         |         +--- io.netty:netty-common:4.1.119.Final
|    |         |         +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |         |         +--- io.netty:netty-transport:4.1.119.Final (*)
|    |         |         \--- io.netty:netty-transport-native-unix-common:4.1.119.Final (*)
|    |         +--- io.projectreactor.netty:reactor-netty-core:1.2.5
|    |         |    +--- io.netty:netty-handler:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-handler-proxy:4.1.119.Final
|    |         |    |    +--- io.netty:netty-common:4.1.119.Final
|    |         |    |    +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |         |    |    +--- io.netty:netty-transport:4.1.119.Final (*)
|    |         |    |    +--- io.netty:netty-codec:4.1.119.Final (*)
|    |         |    |    +--- io.netty:netty-codec-socks:4.1.119.Final
|    |         |    |    |    +--- io.netty:netty-common:4.1.119.Final
|    |         |    |    |    +--- io.netty:netty-buffer:4.1.119.Final (*)
|    |         |    |    |    +--- io.netty:netty-transport:4.1.119.Final (*)
|    |         |    |    |    \--- io.netty:netty-codec:4.1.119.Final (*)
|    |         |    |    \--- io.netty:netty-codec-http:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-resolver-dns:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-resolver-dns-native-macos:4.1.119.Final (*)
|    |         |    +--- io.netty:netty-transport-native-epoll:4.1.119.Final (*)
|    |         |    \--- io.projectreactor:reactor-core:3.7.5 (*)
|    |         \--- io.projectreactor:reactor-core:3.7.5 (*)
|    +--- org.springframework:spring-web:6.2.6 (*)
|    \--- org.springframework:spring-webflux:6.2.6
|         +--- org.springframework:spring-beans:6.2.6 (*)
|         +--- org.springframework:spring-core:6.2.6 (*)
|         +--- org.springframework:spring-web:6.2.6 (*)
|         \--- io.projectreactor:reactor-core:3.7.4 -> 3.7.5 (*)
+--- org.springdoc:springdoc-openapi-starter-webmvc-ui:2.7.0
|    +--- org.springdoc:springdoc-openapi-starter-webmvc-api:2.7.0
|    |    +--- org.springdoc:springdoc-openapi-starter-common:2.7.0
|    |    |    +--- org.springframework.boot:spring-boot-autoconfigure:3.4.0 -> 3.4.5 (*)
|    |    |    \--- io.swagger.core.v3:swagger-core-jakarta:2.2.25
|    |    |         +--- org.apache.commons:commons-lang3:3.17.0
|    |    |         +--- org.slf4j:slf4j-api:2.0.9 -> 2.0.17
|    |    |         +--- io.swagger.core.v3:swagger-annotations-jakarta:2.2.25
|    |    |         +--- io.swagger.core.v3:swagger-models-jakarta:2.2.25
|    |    |         |    \--- com.fasterxml.jackson.core:jackson-annotations:2.16.2 -> 2.18.3 (*)
|    |    |         +--- org.yaml:snakeyaml:2.3
|    |    |         +--- jakarta.xml.bind:jakarta.xml.bind-api:3.0.1 -> 4.0.2
|    |    |         |    \--- jakarta.activation:jakarta.activation-api:2.1.3
|    |    |         +--- jakarta.validation:jakarta.validation-api:3.1.0 -> 3.0.2
|    |    |         +--- com.fasterxml.jackson.core:jackson-annotations:2.16.2 -> 2.18.3 (*)
|    |    |         +--- com.fasterxml.jackson.core:jackson-databind:2.16.2 -> 2.18.3 (*)
|    |    |         +--- com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:2.16.2 -> 2.18.3
|    |    |         |    +--- com.fasterxml.jackson.core:jackson-databind:2.18.3 (*)
|    |    |         |    +--- org.yaml:snakeyaml:2.3
|    |    |         |    +--- com.fasterxml.jackson.core:jackson-core:2.18.3 (*)
|    |    |         |    \--- com.fasterxml.jackson:jackson-bom:2.18.3 (*)
|    |    |         \--- com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.16.2 -> 2.18.3 (*)
|    |    \--- org.springframework:spring-webmvc:6.2.0 -> 6.2.6 (*)
|    +--- org.webjars:swagger-ui:5.18.2
|    \--- org.webjars:webjars-locator-lite:1.0.1
|         \--- org.jspecify:jspecify:1.0.0
+--- io.awspring.cloud:spring-cloud-aws-dependencies:3.1.1
|    +--- software.amazon.awssdk:s3-transfer-manager:2.21.46 (c)
|    +--- software.amazon.awssdk:s3:2.21.46 (c)
|    +--- io.awspring.cloud:spring-cloud-aws-starter-s3:3.1.1 (c)
|    +--- org.eclipse.angus:jakarta.mail:1.0.0 -> 2.0.3 (c)
|    +--- io.awspring.cloud:spring-cloud-aws-s3:3.1.1 (c)
|    +--- io.awspring.cloud:spring-cloud-aws-s3-cross-region-client:3.1.1 (c)
|    +--- io.awspring.cloud:spring-cloud-aws-starter:3.1.1 (c)
|    +--- software.amazon.awssdk:sdk-core:2.21.46 (c)
|    +--- software.amazon.awssdk:utils:2.21.46 (c)
|    +--- software.amazon.awssdk:annotations:2.21.46 (c)
|    +--- software.amazon.awssdk:regions:2.21.46 (c)
|    +--- software.amazon.awssdk:arns:2.21.46 (c)
|    +--- software.amazon.awssdk:aws-core:2.21.46 (c)
|    +--- software.amazon.awssdk:json-utils:2.21.46 (c)
|    +--- software.amazon.awssdk:protocol-core:2.21.46 (c)
|    +--- software.amazon.awssdk:auth:2.21.46 (c)
|    +--- software.amazon.awssdk:http-client-spi:2.21.46 (c)
|    +--- software.amazon.awssdk:aws-xml-protocol:2.21.46 (c)
|    +--- software.amazon.awssdk:profiles:2.21.46 (c)
|    +--- software.amazon.awssdk:http-auth:2.21.46 (c)
|    +--- software.amazon.awssdk:identity-spi:2.21.46 (c)
|    +--- software.amazon.awssdk:http-auth-spi:2.21.46 (c)
|    +--- software.amazon.awssdk:http-auth-aws:2.21.46 (c)
|    +--- software.amazon.awssdk:checksums:2.21.46 (c)
|    +--- software.amazon.awssdk:checksums-spi:2.21.46 (c)
|    +--- software.amazon.awssdk:metrics-spi:2.21.46 (c)
|    +--- io.awspring.cloud:spring-cloud-aws-autoconfigure:3.1.1 (c)
|    +--- io.awspring.cloud:spring-cloud-aws-core:3.1.1 (c)
|    +--- software.amazon.awssdk:third-party-jackson-core:2.21.46 (c)
|    \--- software.amazon.awssdk:aws-query-protocol:2.21.46 (c)
+--- io.awspring.cloud:spring-cloud-aws-starter-s3:3.1.1
|    +--- io.awspring.cloud:spring-cloud-aws-s3:3.1.1
|    |    +--- org.springframework:spring-core:6.1.1 -> 6.2.6 (*)
|    |    +--- org.springframework:spring-context:6.1.1 -> 6.2.6 (*)
|    |    +--- software.amazon.awssdk:s3:2.21.46
|    |    |    +--- software.amazon.awssdk:aws-xml-protocol:2.21.46
|    |    |    |    +--- software.amazon.awssdk:aws-query-protocol:2.21.46
|    |    |    |    |    +--- software.amazon.awssdk:protocol-core:2.21.46
|    |    |    |    |    |    +--- software.amazon.awssdk:sdk-core:2.21.46
|    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    +--- software.amazon.awssdk:http-client-spi:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46
|    |    |    |    |    |    |    |    |    +--- org.reactivestreams:reactive-streams:1.0.4
|    |    |    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |    |    \--- org.slf4j:slf4j-api:1.7.30 -> 2.0.17
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:metrics-spi:2.21.46
|    |    |    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |    |    \--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    |    \--- org.reactivestreams:reactive-streams:1.0.4
|    |    |    |    |    |    |    +--- software.amazon.awssdk:metrics-spi:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:endpoints-spi:2.21.46
|    |    |    |    |    |    |    |    \--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    +--- software.amazon.awssdk:http-auth-spi:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
|    |    |    |    |    |    |    |    +--- org.reactivestreams:reactive-streams:1.0.4
|    |    |    |    |    |    |    |    \--- software.amazon.awssdk:identity-spi:2.21.46
|    |    |    |    |    |    |    |         +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |         \--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:http-auth-aws:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:identity-spi:2.21.46 (*)
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:http-auth-spi:2.21.46 (*)
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:checksums-spi:2.21.46
|    |    |    |    |    |    |    |    |    \--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |    \--- software.amazon.awssdk:checksums:2.21.46
|    |    |    |    |    |    |    |         +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |         \--- software.amazon.awssdk:checksums-spi:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:checksums-spi:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:checksums:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:identity-spi:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:profiles:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    |    \--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    +--- org.slf4j:slf4j-api:1.7.30 -> 2.0.17
|    |    |    |    |    |    |    \--- org.reactivestreams:reactive-streams:1.0.4
|    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    \--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
|    |    |    |    |    +--- software.amazon.awssdk:aws-core:2.21.46
|    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    +--- software.amazon.awssdk:regions:2.21.46
|    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:sdk-core:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:profiles:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:json-utils:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |    \--- software.amazon.awssdk:third-party-jackson-core:2.21.46
|    |    |    |    |    |    |    \--- org.slf4j:slf4j-api:1.7.30 -> 2.0.17
|    |    |    |    |    |    +--- software.amazon.awssdk:auth:2.21.46
|    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:sdk-core:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:identity-spi:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:regions:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:profiles:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:json-utils:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:http-auth-aws:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:http-auth:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
|    |    |    |    |    |    |    |    +--- software.amazon.awssdk:http-auth-spi:2.21.46 (*)
|    |    |    |    |    |    |    |    \--- software.amazon.awssdk:identity-spi:2.21.46 (*)
|    |    |    |    |    |    |    +--- software.amazon.awssdk:http-auth-spi:2.21.46 (*)
|    |    |    |    |    |    |    \--- software.amazon.eventstream:eventstream:1.0.1
|    |    |    |    |    |    +--- software.amazon.awssdk:http-auth-spi:2.21.46 (*)
|    |    |    |    |    |    +--- software.amazon.awssdk:identity-spi:2.21.46 (*)
|    |    |    |    |    |    +--- software.amazon.awssdk:http-auth:2.21.46 (*)
|    |    |    |    |    |    +--- software.amazon.awssdk:http-auth-aws:2.21.46 (*)
|    |    |    |    |    |    +--- software.amazon.awssdk:profiles:2.21.46 (*)
|    |    |    |    |    |    +--- software.amazon.awssdk:sdk-core:2.21.46 (*)
|    |    |    |    |    |    +--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
|    |    |    |    |    |    +--- software.amazon.awssdk:metrics-spi:2.21.46 (*)
|    |    |    |    |    |    +--- software.amazon.awssdk:endpoints-spi:2.21.46 (*)
|    |    |    |    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    |    |    \--- software.amazon.eventstream:eventstream:1.0.1
|    |    |    |    |    +--- software.amazon.awssdk:sdk-core:2.21.46 (*)
|    |    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    |    +--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
|    |    |    |    |    \--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    |    +--- software.amazon.awssdk:protocol-core:2.21.46 (*)
|    |    |    |    +--- software.amazon.awssdk:aws-core:2.21.46 (*)
|    |    |    |    +--- software.amazon.awssdk:sdk-core:2.21.46 (*)
|    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    +--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
|    |    |    |    \--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:protocol-core:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:arns:2.21.46
|    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    \--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:profiles:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:crt-core:2.21.46
|    |    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    |    \--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:http-auth:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:identity-spi:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:http-auth-spi:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:http-auth-aws:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:checksums:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:checksums-spi:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:sdk-core:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:auth:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:regions:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:annotations:2.21.46
|    |    |    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:aws-core:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:metrics-spi:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:json-utils:2.21.46 (*)
|    |    |    \--- software.amazon.awssdk:endpoints-spi:2.21.46 (*)
|    |    +--- com.fasterxml.jackson.core:jackson-databind:2.15.3 -> 2.18.3 (*)
|    |    \--- org.slf4j:slf4j-api:2.0.9 -> 2.0.17
|    +--- io.awspring.cloud:spring-cloud-aws-s3-cross-region-client:3.1.1
|    |    +--- software.amazon.awssdk:s3:2.21.46 (*)
|    |    +--- org.springframework:spring-core:6.1.1 -> 6.2.6 (*)
|    |    \--- org.slf4j:slf4j-api:2.0.9 -> 2.0.17
|    +--- io.awspring.cloud:spring-cloud-aws-starter:3.1.1
|    |    +--- io.awspring.cloud:spring-cloud-aws-autoconfigure:3.1.1
|    |    |    +--- org.springframework.boot:spring-boot-autoconfigure:3.2.0 -> 3.4.5 (*)
|    |    |    +--- software.amazon.awssdk:aws-core:2.21.46 (*)
|    |    |    \--- org.slf4j:slf4j-api:2.0.9 -> 2.0.17
|    |    +--- io.awspring.cloud:spring-cloud-aws-core:3.1.1
|    |    |    +--- software.amazon.awssdk:regions:2.21.46 (*)
|    |    |    +--- software.amazon.awssdk:auth:2.21.46 (*)
|    |    |    +--- org.springframework:spring-core:6.1.1 -> 6.2.6 (*)
|    |    |    \--- org.slf4j:slf4j-api:2.0.9 -> 2.0.17
|    |    +--- org.springframework.boot:spring-boot-starter:3.2.0 -> 3.4.5 (*)
|    |    \--- org.slf4j:slf4j-api:2.0.9 -> 2.0.17
|    \--- org.slf4j:slf4j-api:2.0.9 -> 2.0.17
+--- software.amazon.awssdk:s3 -> 2.21.46 (*)
+--- software.amazon.awssdk:s3-transfer-manager -> 2.21.46
|    +--- software.amazon.awssdk:s3:2.21.46 (*)
|    +--- software.amazon.awssdk:sdk-core:2.21.46 (*)
|    +--- software.amazon.awssdk:utils:2.21.46 (*)
|    +--- software.amazon.awssdk:annotations:2.21.46
|    +--- software.amazon.awssdk:regions:2.21.46 (*)
|    +--- software.amazon.awssdk:arns:2.21.46 (*)
|    +--- software.amazon.awssdk:aws-core:2.21.46 (*)
|    +--- software.amazon.awssdk:json-utils:2.21.46 (*)
|    +--- software.amazon.awssdk:protocol-core:2.21.46 (*)
|    +--- software.amazon.awssdk:auth:2.21.46 (*)
|    \--- software.amazon.awssdk:http-client-spi:2.21.46 (*)
\--- org.apache.tika:tika-core:2.8.0
     +--- org.slf4j:slf4j-api:2.0.7 -> 2.0.17
     \--- commons-io:commons-io:2.11.0

```

</div>
</details>

<br>

## 환경변수

### application.properties
```
spring.application.name=damdam
spring.profiles.active=local
spring.profiles.include=API-KEY
```

### application-API-KEY.properties
```
프로젝트 내 파일 업로드 예정
```

### application-local.properties
```
프로젝트 내 파일 존재
```

### application-prod.properties (사용하지 않음)

<br>

## CORS 설정

```
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList(
			"http://localhost:8080",
			"https://localhost:8080",
			"http://localhost:5173",
			"https://localhost:5173",
			"http://localhost:3000",
			"https://localhost:3000",
			"http://k12s202.p.ssafy.io",
			"https://k12s202.p.ssafy.io",
			"http://damdam.kr",
			"https://damdam.kr",
			"http://www.damdam.kr",
			"https://www.damdam.kr"
		));
		configuration.setAllowedMethods(Collections.singletonList("*"));
		configuration.setAllowedHeaders(Collections.singletonList("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
```

<br>

## Spring boot 외부 API 이용 현황

### Fast API를 통한 외부 작업 request - response

- 감정분석 모델(음성) : https://k12s202.p.ssafy.io/ai-analyze/audio
- 감정분석 모델(텍스트) : https://k12s202.p.ssafy.io/ai-analyze/text
- 채팅용 LLM : https://k12s202.p.ssafy.io/ai-data/chat
- 세션별 레포트 생성 LLM : https://k12s202.p.ssafy.io/ai-data/summary
- 기간별 레포트 생성 LLM : https://k12s202.p.ssafy.io/ai-data/period-report
- Apache Spark Master에서 대화 목록을 받아보는 API : http://43.201.84.232:5000/results


<br>

## 외부 서비스 이용 현황

### 소셜 로그인

- 네이버
- 카카오
- 구글

### 메일 전송

- 구글 메일
- Hunter.io (이메일 유효성 검사)

### 스토리지

- S3 버킷 개인 플랜

<br>

## API 명세

### 스웨거를 통한 API 명세 및 테스트

[Swagger로 이동하기](https://www.damdam.kr/swagger-ui/index.html)

<br>

## 로깅 방법

### `docker logs -f backend`
