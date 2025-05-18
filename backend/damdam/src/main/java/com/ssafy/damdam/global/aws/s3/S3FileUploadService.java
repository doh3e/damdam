package com.ssafy.damdam.global.aws.s3;

import static com.ssafy.damdam.global.aws.s3.exception.S3ExceptionCode.*;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.domain.counsels.dto.LlmSummaryRequest;
import com.ssafy.damdam.global.aws.s3.exception.S3Exception;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.model.Upload;
import software.amazon.awssdk.transfer.s3.model.UploadRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3FileUploadService {

	@Value("${spring.cloud.aws.s3.bucket}")
	private String bucket;

	@Value("${spring.cloud.aws.s3.bucket.url}")
	private String defaultUrl;

	private static final ExecutorService EXECUTOR = Executors.newFixedThreadPool(5);

	private final S3TransferManager transferManager;
	private final S3AsyncClient s3AsyncClient;
	private final Tika tika;
	private final ExecutorService virtualThreadExecutor;
	private final ObjectMapper objectMapper;

	/**
	 * 이미지 파일을 S3에 업로드하고, 이전 파일이 있으면 삭제 후 새 URL을 반환합니다.
	 * @param uploadFile 업로드할 MultipartFile (이미지)
	 * @param folder     버킷 내에 저장할 폴더명 (예: "profiles")
	 * @param oldKey     이전에 저장된 S3 객체 키 (삭제할 대상), 없으면 null 또는 빈 문자열
	 * @return 업로드된 파일의 URL
	 */
	@Transactional
	public String uploadFile(MultipartFile uploadFile, String folder, String oldKey) throws IOException {
		if (!isImage(uploadFile)) {
			throw new S3Exception(IS_NOT_IMAGE);
		}

		String origName = uploadFile.getOriginalFilename();
		String ext = origName.substring(origName.lastIndexOf('.'));
		String saveFileName = UUID.randomUUID().toString().replaceAll("-", "") + ext;
		String s3Key = folder + "/" + saveFileName;

		if (!ext.equalsIgnoreCase(".jpg")
			&& !ext.equalsIgnoreCase(".jpeg")
			&& !ext.equalsIgnoreCase(".png")) {
			throw new S3Exception(IS_NOT_IMAGE);
		}

		PutObjectRequest putReq = PutObjectRequest.builder()
			.bucket(bucket)
			.key(s3Key)
			.contentType(tika.detect(uploadFile.getInputStream()))
			.build();

		Upload upload = transferManager.upload(
			UploadRequest.builder()
				.putObjectRequest(putReq)
				.requestBody(
					AsyncRequestBody.fromInputStream(
						uploadFile.getInputStream(),
						uploadFile.getSize(),
						EXECUTOR
					)
				)
				.build()
		);

		upload.completionFuture().join();

		if (oldKey != null && !oldKey.isBlank()) {
			s3AsyncClient.deleteObject(b -> b.bucket(bucket).key(oldKey)).join();
		}

		String imageUrl = defaultUrl + s3Key;
		return imageUrl;
	}

	private boolean isImage(MultipartFile file) {
		try {
			String mime = tika.detect(file.getInputStream());
			return mime.startsWith("image/");
		} catch (IOException e) {
			throw new S3Exception(IMAGE_TRNAS_BAD_REQUEST);
		}
	}

	public String uploadAudio(MultipartFile file, String folder) {
		try {
			return virtualThreadExecutor.submit(() -> {
				try {
					// 1. 파일 이름과 확장자 처리
					String origName = file.getOriginalFilename();
					String ext = origName.substring(origName.lastIndexOf('.')).toLowerCase();
					String saveFileName = UUID.randomUUID().toString().replaceAll("-", "") + ext;
					String s3Key = folder + "/" + saveFileName;

					if (!ext.equals(".mp3") && !ext.equals(".wav") && !ext.equals(".m4a")) {
						throw new S3Exception(IS_NOT_AUDIO);
					}

					PutObjectRequest putReq = PutObjectRequest.builder()
						.bucket(bucket)
						.key(s3Key)
						.contentType(tika.detect(file.getInputStream()))
						.build();

					Upload upload = transferManager.upload(
						UploadRequest.builder()
							.putObjectRequest(putReq)
							.requestBody(
								AsyncRequestBody.fromInputStream(
									file.getInputStream(),
									file.getSize(),
									EXECUTOR
								)
							)
							.build()
					);

					upload.completionFuture().join();
					return defaultUrl + s3Key;

				} catch (IOException e) {
					log.error("[S3] 오디오 업로드 실패", e);
					throw new UncheckedIOException(e);
				}
			}).get();

		} catch (Exception e) {
			throw new RuntimeException("오디오 업로드 중 예외 발생", e); // .get()의 checked 예외 처리
		}
	}

	public String uploadFullText(LlmSummaryRequest llmSummaryRequest) throws JsonProcessingException {
		try {
			String json = objectMapper.writeValueAsString(llmSummaryRequest);
			byte[] bytes = json.getBytes(StandardCharsets.UTF_8);

			String fileName = UUID.randomUUID() + ".json";
			String s3Key = "origin_texts" + "/" + fileName;

			PutObjectRequest putReq = PutObjectRequest.builder()
				.bucket(bucket)
				.key(s3Key)
				.contentType("application/json")
				.contentLength((long)bytes.length)
				.build();

			Upload upload = transferManager.upload(
				UploadRequest.builder()
					.putObjectRequest(putReq)
					.requestBody(AsyncRequestBody.fromBytes(bytes))
					.build()
			);
			upload.completionFuture().join();

			return defaultUrl + s3Key;
		} catch (JsonProcessingException e) {
			log.error("[S3] JSON 직렬화 실패", e);
			throw new S3Exception(JSON_SERIALIZATION_FAIL);
		}
	}
}
