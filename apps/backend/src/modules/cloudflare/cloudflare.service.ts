// upload.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Image, ImageGallery } from 'src/types';
import { ProductService } from '../product/product.service';

@Injectable()
export class CloudflareService {
  constructor(private readonly configService: ConfigService) {}
  private s3 = new S3Client({
    region: 'auto',
    endpoint: this.configService.getOrThrow<string>('R2_ENDPOINT'),
    credentials: {
      accessKeyId: this.configService.getOrThrow<string>('R2_ACCESS_KEY'),
      secretAccessKey: this.configService.getOrThrow<string>('R2_SECRET_KEY'),
    },
  });

  private bucket = this.configService.getOrThrow<string>('R2_BUCKET');

  async uploadToR2(file: Express.Multer.File): Promise<Image> {
    /*
    // Obter metadados da imagem original
    const metadata = await sharp(file.buffer).metadata();

    // Preservar as dimensões originais
    const width = metadata.width;
    const height = metadata.height;

    // Iniciar processamento com Sharp
    const image = sharp(file.buffer)
      // Manter os metadados originais (EXIF, etc)
      .withMetadata()
      // Evitar redimensionamento não intencional
      .resize(width, height, {
        fit: 'contain',
        withoutEnlargement: true,
      });

    let optimizedImage: Buffer;

    if (file.mimetype === 'image/png') {
      optimizedImage = await image
        .png({
          quality: 100,
          compressionLevel: 6, // Equilíbrio entre qualidade e tamanho (0-9)
          palette: true, // Melhor cor para PNGs com transparência
          colors: 256, // Máximo de cores para PNG indexado
        })
        .toBuffer();
    } else if (file.mimetype === 'image/webp') {
      optimizedImage = await image
        .webp({
          quality: 98,
          alphaQuality: 100, // Máxima qualidade para transparência
          lossless: true, // Sem perda para WebP
        })
        .toBuffer();
    } else {
      optimizedImage = await image
        .jpeg({
          quality: 98, // Qualidade muito alta
          chromaSubsampling: '4:4:4', // Qualidade de cor máxima
          mozjpeg: true, // Usar otimizações mozjpeg
          trellisQuantisation: true, // Melhora a qualidade em áreas complexas
          overshootDeringing: true, // Reduz artefatos em bordas
          optimizeScans: true, // Otimização progressiva
        })
        .toBuffer();
    }
*/
    const key = `${randomUUID()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      url: `${process.env.R2_PUBLIC_URL}/${key}`,
      LastModified: new Date().toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      size: `${(file.buffer.length / 1048576).toFixed(2)} MB`,
    };
  }

  async getAllImages(): Promise<ImageGallery> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
    });

    const response = await this.s3.send(command);

    const files = response.Contents || [];

    return {
      images: files.map((file) => ({
        key: file.Key,
        url: `${process.env.R2_PUBLIC_URL}/${file.Key}`,
        size: `${(file.Size / 1048576).toFixed(2)} MB`,
        LastModified: new Date(file.LastModified).toLocaleDateString('pt-PT', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      })),
    };
  }
  async deleteImages(
    keys: string[],
  ): Promise<{ deleted: string[]; notDeleted: string[] }> {
    if (!keys || keys.length === 0) {
      return { deleted: [], notDeleted: [] };
    }

    // Delete multiple objects at once from S3/R2
    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    try {
      const response = await this.s3.send(command);
      const deletedKeys = response.Deleted?.map((obj) => obj.Key) || [];
      const notDeletedKeys = response.Errors?.map((err) => err.Key) || [];

      return {
        deleted: deletedKeys,
        notDeleted: notDeletedKeys,
      };
    } catch (error) {
      console.error('Error deleting images:', error);
      throw new Error(`Failed to delete images: ${error.message}`);
    }
  }
  async deleteImagesIfNotInUse(
    imageKeys: string[] | string,
    productService: ProductService,
  ): Promise<{ deleted: string[]; notDeleted: string[]; inUse: string[] }> {
    // Handle both single key (string) or multiple keys (string[])
    const keys: string[] = Array.isArray(imageKeys) ? imageKeys : [imageKeys];

    if (!keys || keys.length === 0) {
      return { deleted: [], notDeleted: [], inUse: [] };
    }

    // Check if any of these images are used in products
    const imageUsage = await productService.findProductsByImageKeys(keys);

    // Separate keys into those in use and those not in use
    const keysInUse: string[] = [];
    const keysToDelete: string[] = [];

    keys.forEach((key) => {
      if (imageUsage[key]) {
        keysInUse.push(key);
      } else {
        keysToDelete.push(key);
      }
    });

    // Only proceed with deletion if we have keys that aren't in use
    let deleteResult = { deleted: [], notDeleted: [] };
    if (keysToDelete.length > 0) {
      // Delete only unused images
      deleteResult = await this.deleteImages(keysToDelete);
    }

    return {
      deleted: deleteResult.deleted,
      notDeleted: deleteResult.notDeleted,
      inUse: keysInUse,
    };
  }
}
