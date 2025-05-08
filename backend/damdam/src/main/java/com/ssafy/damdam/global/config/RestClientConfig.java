package com.ssafy.damdam.global.config;

import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.util.Timeout;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestClientConfig {
	// 커넥션 풀 크기 상수
	@Value("${rest.client.max-total-connections}")
	private int maxTotalConnections;

	@Value("${rest.client.max-per-route}")
	private int maxPerRoute;

	@Value("${rest.client.read-timeout}")
	private int readTimeout;

	@Value("${rest.client.connect-timeout}")
	private int connectTimeout;

	@Bean
	public RestTemplate restTemplate() {
		HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
		factory.setHttpClient(createHttpClient());
		return new RestTemplate(factory);
	}

	private CloseableHttpClient createHttpClient() {
		// 풀 매니저 생성 및 크기 설정
		PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager();
		cm.setMaxTotal(maxTotalConnections);
		cm.setDefaultMaxPerRoute(maxPerRoute);

		// 타임아웃 설정
		RequestConfig config = RequestConfig.custom()
			.setConnectionRequestTimeout(Timeout.ofMilliseconds(connectTimeout))
			.setResponseTimeout(Timeout.ofMilliseconds(readTimeout))
			.build();

		return HttpClients.custom()
			.setConnectionManager(cm)
			.setDefaultRequestConfig(config)
			.build();
	}

	@Bean
	public RestClient restClient(RestTemplate restTemplate) {
		return RestClient.create(restTemplate);
	}
}
