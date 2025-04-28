package com.ssafy.damdam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.ssafy.damdam.domain")
public class DamdamApplication {

	public static void main(String[] args) {
		SpringApplication.run(DamdamApplication.class, args);
	}

}
