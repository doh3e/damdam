package com.ssafy.damdam.global.webclient.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "sparkapi.result")
public class SparkProperties {
	private String sparkUrl;
}
