package com.ssafy.damdam.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SwaggerConfig {
	@Bean
	public OpenAPI openAPI() {
		return new OpenAPI().addSecurityItem(new SecurityRequirement().addList("JWT"))
			.components(new Components().addSecuritySchemes("JWT", createAPIKeyScheme()))
			.info(apiInfo());
	}

	private Info apiInfo() {
		return new Info()
			.title("DAMDAM REST API Documentation")
			.description("담담 REST API 문서")
			.version("1.0.0");
	}

	private SecurityScheme createAPIKeyScheme() {
		return new SecurityScheme().type(SecurityScheme.Type.HTTP)
			.bearerFormat("JWT")
			.scheme("bearer")
			.in(SecurityScheme.In.HEADER)
			.name("Authorization");
	}
}
