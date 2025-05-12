package com.ssafy.damdam.global.aws.s3;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.Upload;
import com.ssafy.docshund.global.aws.s3.exception.S3Exception;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import static com.ssafy.docshund.global.aws.s3.exception.S3ExceptionCode.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3FileUploadService {

	@Value("${cloud.aws.s3.bucket}")
	private String bucket;

	@Value("${cloud.aws.s3.bucket.url}")
	private String defaultUrl;

	private final AmazonS3Client amazonS3Client;

	private final Tika tika;

	@Transactional
	public String uploadFile(MultipartFile uploadFile, String folder) throws AmazonS3Exception {
		if (!isImage(uploadFile)) {
			throw new S3Exception(IS_NOT_IMAGE);
		}

		String origName = uploadFile.getOriginalFilename();
		String ext = origName.substring(origName.lastIndexOf('.'));
		String saveFileName = UUID.randomUUID().toString().replaceAll("-", "") + ext;
		String s3FolderPath = folder + "/" + saveFileName;

		if (!ext.equalsIgnoreCase(".jpg") && !ext.equalsIgnoreCase(".jpeg") && !ext.equalsIgnoreCase(".png")) {
			throw new S3Exception(IS_NOT_IMAGE);
		}

		File file = new File(System.getProperty("user.dir") + saveFileName);

		try {
			uploadFile.transferTo(file);
		} catch (IOException e) {
			throw new S3Exception(IMAGE_TRNAS_BAD_REQUEST);
		}

		TransferManager transferManager = new TransferManager(this.amazonS3Client);

		PutObjectRequest request = new PutObjectRequest(bucket, s3FolderPath, file);

		Upload upload = transferManager.upload(request);

		try {
			upload.waitForCompletion();
		} catch (InterruptedException e) {
			throw new S3Exception(IMAGE_UPLOAD_BAD_REQUEST);
		}

		String imageUrl = defaultUrl + s3FolderPath;

		file.delete();
		log.info("SERVICE Uri = " + imageUrl);
		return imageUrl;
	}

	private boolean isImage(MultipartFile file) {
		String mimeType = null;
		try {
			mimeType = tika.detect(file.getInputStream());
			log.info("Detected MIME type: {}", mimeType); // 로그 추가
		} catch (IOException e) {
			throw new S3Exception(IMAGE_TRNAS_BAD_REQUEST);
		}
		return mimeType.startsWith("image/");
	}
}
