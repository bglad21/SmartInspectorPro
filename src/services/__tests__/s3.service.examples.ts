/**
 * S3 Service Test Examples
 * Demonstrates usage of the S3 service with real-world scenarios
 */

// @ts-nocheck

import S3Service from '../s3.service';

/**
 * Example 1: Upload a single inspection photo with progress tracking
 */
export async function uploadInspectionPhoto() {
  try {
    const result = await S3Service.uploadFile({
      uri: 'file:///path/to/photo.jpg',
      filename: `inspection-${Date.now()}.jpg`,
      folder: 'inspections',
      inspectionId: 'insp-123',
      onProgress: progress => {
        console.log(`Upload progress: ${progress}%`);
      },
    });

    console.log('Photo uploaded successfully:');
    console.log('- S3 Key:', result.key);
    console.log('- CloudFront URL:', result.url);
    console.log('- Size:', result.size, 'bytes');
    console.log('- Duration:', result.duration, 'ms');

    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Example 2: Batch upload multiple photos
 */
export async function uploadMultiplePhotos() {
  const photos = [
    { uri: 'file:///path/to/photo1.jpg', filename: 'photo1.jpg' },
    { uri: 'file:///path/to/photo2.jpg', filename: 'photo2.jpg' },
    { uri: 'file:///path/to/photo3.jpg', filename: 'photo3.jpg' },
  ];

  try {
    const result = await S3Service.uploadBatch({
      files: photos,
      folder: 'inspections',
      inspectionId: 'insp-123',
      onProgress: progress => {
        console.log(`Batch upload progress: ${progress}%`);
      },
      parallel: true,
      maxConcurrent: 3,
    });

    console.log('Batch upload complete:');
    console.log(`- Successful: ${result.successful.length}/${photos.length}`);
    console.log(`- Failed: ${result.failed.length}`);
    console.log(`- Success rate: ${Math.round(result.successRate * 100)}%`);
    console.log(`- Total duration: ${result.totalDuration}ms`);

    if (result.failed.length > 0) {
      console.log('Failed uploads:', result.failed);
    }

    return result;
  } catch (error) {
    console.error('Batch upload failed:', error);
    throw error;
  }
}

/**
 * Example 3: List all photos for an inspection
 */
export async function listInspectionPhotos(inspectionId: string) {
  try {
    const photos = await S3Service.listFiles({
      prefix: `inspections/${inspectionId}/photos/`,
      accessLevel: 'protected',
    });

    console.log(
      `Found ${photos.length} photos for inspection ${inspectionId}:`,
    );
    photos.forEach((photo, index) => {
      console.log(`${index + 1}. ${photo.key}`);
      console.log(`   URL: ${photo.url}`);
      console.log(`   Size: ${(photo.size / 1024).toFixed(2)} KB`);
      console.log(`   Modified: ${photo.lastModified.toLocaleString()}`);
    });

    return photos;
  } catch (error) {
    console.error('List photos failed:', error);
    throw error;
  }
}

/**
 * Example 4: Download a photo
 */
export async function downloadPhoto(key: string) {
  try {
    const blob = await S3Service.downloadFile({
      key,
      onProgress: progress => {
        console.log(`Download progress: ${progress}%`);
      },
    });

    console.log('Photo downloaded successfully');
    console.log('Blob size:', blob.size, 'bytes');

    // In React Native, you might save to local file system
    // const base64 = await blobToBase64(blob);
    // await FileSystem.writeAsStringAsync(localPath, base64, { encoding: 'base64' });

    return blob;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * Example 5: Delete an old photo
 */
export async function deleteOldPhoto(key: string) {
  try {
    await S3Service.deleteFile({ key });
    console.log('Photo deleted successfully:', key);
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

/**
 * Example 6: Delete multiple photos
 */
export async function deleteInspectionPhotos(inspectionId: string) {
  try {
    // First, list all photos for the inspection
    const photos = await S3Service.listFiles({
      prefix: `inspections/${inspectionId}/photos/`,
    });

    if (photos.length === 0) {
      console.log('No photos to delete');
      return;
    }

    // Delete all photos
    const keys = photos.map(photo => photo.key);
    const result = await S3Service.deleteBatch(keys);

    console.log('Batch delete complete:');
    console.log(`- Successful: ${result.successful}`);
    console.log(`- Failed: ${result.failed}`);

    return result;
  } catch (error) {
    console.error('Batch delete failed:', error);
    throw error;
  }
}

/**
 * Example 7: Upload with retry on network failure
 */
export async function uploadWithRetry() {
  try {
    const result = await S3Service.uploadFile({
      uri: 'file:///path/to/photo.jpg',
      filename: 'retry-test.jpg',
      folder: 'inspections',
      enableRetry: true,
      maxRetries: 5, // More retries for flaky network
      onProgress: progress => {
        console.log(`Upload progress: ${progress}%`);
      },
    });

    console.log('Upload succeeded with retry enabled');
    return result;
  } catch (error) {
    console.error('Upload failed even with retries:', error);
    throw error;
  }
}

/**
 * Example 8: Get CloudFront URL for existing S3 key
 */
export function getPhotoUrl(s3Key: string): string {
  const url = S3Service.getUrl(s3Key);
  console.log('CloudFront URL:', url);
  return url;
}

/**
 * Example 9: Check S3 service configuration
 */
export function checkConfiguration() {
  const config = S3Service.getConfig();
  console.log('S3 Service Configuration:');
  console.log('- Bucket:', config.bucket);
  console.log('- CloudFront Domain:', config.cloudFrontDomain);
  console.log('- CloudFront URL:', config.cloudFrontUrl);
  console.log('- Default Access Level:', config.defaultAccessLevel);
  console.log('- Max Retries:', config.maxRetries);
  return config;
}

/**
 * Complete workflow: Upload inspection photos and generate report
 */
export async function completeInspectionWorkflow(
  inspectionId: string,
  photoUris: string[],
) {
  console.log(`\n=== Starting inspection workflow for ${inspectionId} ===\n`);

  try {
    // 1. Upload all photos
    console.log('Step 1: Uploading photos...');
    const files = photoUris.map((uri, index) => ({
      uri,
      filename: `photo-${index + 1}.jpg`,
    }));

    const uploadResult = await S3Service.uploadBatch({
      files,
      folder: 'inspections',
      inspectionId,
      onProgress: progress => {
        console.log(`Overall upload progress: ${progress}%`);
      },
    });

    console.log(`\nUploaded ${uploadResult.successful.length} photos\n`);

    // 2. List all photos to verify
    console.log('Step 2: Verifying uploaded photos...');
    const allPhotos = await S3Service.listFiles({
      prefix: `inspections/${inspectionId}/photos/`,
    });

    console.log(`Verified: ${allPhotos.length} photos in S3\n`);

    // 3. Generate report (simulated)
    console.log('Step 3: Generating report with photo URLs...');
    const reportData = {
      inspectionId,
      photoCount: allPhotos.length,
      photos: allPhotos.map(photo => ({
        url: photo.url,
        size: photo.size,
        uploaded: photo.lastModified,
      })),
    };

    console.log('Report generated:', JSON.stringify(reportData, null, 2));

    console.log('\n=== Inspection workflow complete ===\n');

    return {
      uploadResult,
      allPhotos,
      reportData,
    };
  } catch (error) {
    console.error('\n=== Inspection workflow failed ===\n', error);
    throw error;
  }
}
