import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private configService: ConfigService) {
    this.cloudName =
      this.configService.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    this.apiKey = this.configService.get<string>('CLOUDINARY_API_KEY') ?? '';
    this.apiSecret =
      this.configService.get<string>('CLOUDINARY_API_SECRET') ?? '';

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      this.logger.error('Cloudinary configuration variables missing.');
    }
  }

  /**
   * Convert file buffer → Blob (required for Cloudinary fetch upload)
   */
  /**
   * Convert Buffer → Blob for FormData streaming
   */
  private bufferToBlob(buffer: Buffer, mimetype: string): Blob {
    return new Blob([buffer], { type: mimetype || 'application/octet-stream' });
  }

  /**
   * Upload any file to Cloudinary (PDF, DOCX, JPG, etc.)
   * Uses signed upload preset (secured)
   */
  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    folder: string,
    mimetype: string,
  ): Promise<{ url: string; publicId: string }> {
    try {
      this.logger.log(`Signed upload: ${filename} → folder: ${folder}`);

      const timestamp = Math.floor(Date.now() / 1000);

      // 1️⃣ Build the signature base (alphabetically sorted params)
      const signatureString = `folder=${folder}&timestamp=${timestamp}${this.apiSecret}`;

      // 2️⃣ SHA1 signature
      const signature = crypto
        .createHash('sha1')
        .update(signatureString)
        .digest('hex');

      // 3️⃣ Build request form data
      const formData = new FormData();
      formData.append(
        'file',
        this.bufferToBlob(fileBuffer, mimetype),
        filename,
      );
      formData.append('folder', folder);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('api_key', this.apiKey);

      // 4️⃣ POST to Cloudinary /raw/upload for documents
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/raw/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const resText = await response.text();

      if (!response.ok) {
        this.logger.error(`Cloudinary error: ${resText}`);
        throw new Error('Cloudinary signed upload failed');
      }

      const data = JSON.parse(resText);

      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Signed upload failed: ${message}`);
      throw new Error(message);
    }
  }

  /**
   * Upload cooperative documents
   */
  async uploadDocument(
    fileBuffer: Buffer,
    filename: string,
    cooperativeId: string,
    mimetype: string,
  ) {
    return this.uploadFile(fileBuffer, filename, cooperativeId, mimetype);
  }

  /**
   * Upload issued certificates (PDF)
   */
  async uploadCertificate(
    fileBuffer: Buffer,
    filename: string,
    cooperativeId: string,
    mimetype: string = 'application/pdf',
  ) {
    const folder = `bauchi_coop_certificates/${cooperativeId}`;
    return await this.uploadFile(fileBuffer, filename, folder, mimetype);
  }

  /**
   * GENERATE SECURE, TEMPORARY DOWNLOAD URL
   * (Only works for private/authenticated resources)
   */
  generateSignedDownloadUrl(publicId: string, expiresInMinutes = 60): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const expiresAt = timestamp + expiresInMinutes * 60;

    const signatureBase = `public_id=${publicId}&expires_at=${expiresAt}${this.configService.get<string>('CLOUDINARY_API_SECRET')}`;
    const signature = require('crypto')
      .createHash('sha256')
      .update(signatureBase)
      .digest('hex');

    return `https://res.cloudinary.com/${this.cloudName}/raw/upload/s_${signature},e_${expiresAt}/${publicId}`;
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');

      const sigBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = require('crypto')
        .createHash('sha1')
        .update(sigBase)
        .digest('hex');

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('api_key', apiKey);

      const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/raw/destroy`;

      const response = await fetch(url, { method: 'POST', body: formData });

      if (!response.ok) {
        this.logger.error(`Failed deletion: ${await response.text()}`);
        return false;
      }

      this.logger.log(`Deleted Cloudinary file: ${publicId}`);
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Deletion error: ' + message);
      return false;
    }
  }
}
