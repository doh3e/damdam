package com.ssafy.damdam.global.aws.s3;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.transfer.s3.S3TransferManager;

@Configuration
public class S3Config {

	@Value("${spring.cloud.aws.credentials.access-key}")
	private String accessKey;

	@Value("${spring.cloud.aws.credentials.secret-key}")
	private String secretKey;

	@Value("${spring.cloud.aws.region.static}")
	private String region;

	@Bean
	public S3AsyncClient s3AsyncClient() {
		AwsBasicCredentials creds = AwsBasicCredentials.create(accessKey, secretKey);
		return S3AsyncClient.builder()
				.region(Region.of(region))
				.credentialsProvider(StaticCredentialsProvider.create(creds))
				.build();
	}

	@Bean
	public S3TransferManager transferManager(S3AsyncClient s3AsyncClient) {
		return S3TransferManager.builder()
				.s3Client(s3AsyncClient)
				.build();
	}
}
