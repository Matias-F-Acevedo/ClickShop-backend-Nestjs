import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';



@Injectable()
export class ImagesService {
  constructor(private readonly firebaseService: FirebaseService) { }

  async getPublicUrl(imagePath: string): Promise<string> {
    try {
      const storage = this.firebaseService.getStorageInstance();
      const bucket = storage.bucket();
      const fileUpload = bucket.file(imagePath);

      const [url] = await fileUpload.getSignedUrl({ action: 'read', expires: '03-09-9999' });

      return url;

    } catch (error) {
      throw new Error('Error getting the public URL of the image');
    }
  }

  async uploadImage(file, filePath: string): Promise<string> {
    try {
      const storage = this.firebaseService.getStorageInstance();
      const bucket = storage.bucket();
      const fileUpload = bucket.file(filePath);

      await fileUpload.save(file.buffer, {
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      return filePath;

    } catch (error) {
      throw new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async deleteImage(imagePath: string) {
    try {
      const storage = this.firebaseService.getStorageInstance();
      const bucket = storage.bucket();
      const fileToDelete = bucket.file(imagePath);
      const result = await fileToDelete.delete();
      return result
    } catch (error) {
      throw new HttpException('Failed to delete image from Firebase Storage', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async listFilesInFolder(folderPath: string):Promise<string[]> {
    try {
      const storage = this.firebaseService.getStorageInstance();
      const bucket = storage.bucket();
      const files = await bucket.getFiles({ prefix: folderPath });

      const fileNames = files[0].map(file => {
        // elimina la parte de la ruta correspondiente a la carpeta
        return file.name.replace(`${folderPath}/`, '');
    });
    return fileNames;

    } catch (error) {
      throw new HttpException('Error listing files in folder', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



}
