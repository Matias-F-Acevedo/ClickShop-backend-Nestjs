import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { HttpException } from '@nestjs/common';
import { Storage } from 'firebase-admin/lib/storage/storage';

describe('ImagesService', () => {
  let imagesService: ImagesService;
  let firebaseService: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: FirebaseService,
          useValue: {
            getStorageInstance: jest.fn(),
          },
        },
      ],
    }).compile();

    imagesService = module.get<ImagesService>(ImagesService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  describe('getPublicUrl', () => {
    it('should return the public URL of the image', async () => {
      const mockUrl = 'http://fakeurl.com/image.png';
      const getSignedUrl = jest.fn().mockResolvedValue([mockUrl]);
      const fileUpload = { getSignedUrl };
      const bucket = { file: jest.fn().mockReturnValue(fileUpload) };
      const storage = { bucket: jest.fn().mockReturnValue(bucket) } as Partial<Storage> as Storage;

      jest.spyOn(firebaseService, 'getStorageInstance').mockReturnValue(storage);

      const result = await imagesService.getPublicUrl('path/to/image.png');
      expect(result).toBe(mockUrl);
    });

    it('should throw an error if it fails to get the public URL', async () => {
      const getSignedUrl = jest.fn().mockRejectedValue(new Error('Error getting the public URL'));
      const fileUpload = { getSignedUrl };
      const bucket = { file: jest.fn().mockReturnValue(fileUpload) };
      const storage = { bucket: jest.fn().mockReturnValue(bucket) } as Partial<Storage> as Storage;

      jest.spyOn(firebaseService, 'getStorageInstance').mockReturnValue(storage);

      await expect(imagesService.getPublicUrl('path/to/image.png')).rejects.toThrow('Error getting the public URL of the image');
    });
  });

  describe('uploadImage', () => {
    it('should upload the image and return the file path', async () => {
      const file = { buffer: Buffer.from('fake-buffer'), mimetype: 'image/png' };
      const save = jest.fn().mockResolvedValue(undefined);
      const fileUpload = { save };
      const bucket = { file: jest.fn().mockReturnValue(fileUpload) };
      const storage = { bucket: jest.fn().mockReturnValue(bucket) } as Partial<Storage> as Storage;

      jest.spyOn(firebaseService, 'getStorageInstance').mockReturnValue(storage);

      const result = await imagesService.uploadImage(file, 'path/to/image.png');
      expect(result).toBe('path/to/image.png');
    });

    it('should throw an HttpException if it fails to upload the image', async () => {
      const file = { buffer: Buffer.from('fake-buffer'), mimetype: 'image/png' };
      const save = jest.fn().mockRejectedValue(new Error('Error uploading the image'));
      const fileUpload = { save };
      const bucket = { file: jest.fn().mockReturnValue(fileUpload) };
      const storage = { bucket: jest.fn().mockReturnValue(bucket) } as Partial<Storage> as Storage;

      jest.spyOn(firebaseService, 'getStorageInstance').mockReturnValue(storage);

      await expect(imagesService.uploadImage(file, 'path/to/image.png')).rejects.toThrow(HttpException);
      await expect(imagesService.uploadImage(file, 'path/to/image.png')).rejects.toThrow('INTERNAL SERVER ERROR');
    });
  });

  describe('deleteImage', () => {
    it('should delete the image from Firebase Storage', async () => {
      const deleteMock = jest.fn().mockResolvedValue([{}]);
      const fileToDelete = { delete: deleteMock };
      const bucket = { file: jest.fn().mockReturnValue(fileToDelete) };
      const storage = { bucket: jest.fn().mockReturnValue(bucket) } as Partial<Storage> as Storage;

      jest.spyOn(firebaseService, 'getStorageInstance').mockReturnValue(storage);

      const result = await imagesService.deleteImage('path/to/image.png');
      expect(result).toEqual([{}]);
    });

    it('should throw an HttpException if it fails to delete the image', async () => {
      const deleteMock = jest.fn().mockRejectedValue(new Error('Error deleting the image'));
      const fileToDelete = { delete: deleteMock };
      const bucket = { file: jest.fn().mockReturnValue(fileToDelete) };
      const storage = { bucket: jest.fn().mockReturnValue(bucket) } as Partial<Storage> as Storage;

      jest.spyOn(firebaseService, 'getStorageInstance').mockReturnValue(storage);

      await expect(imagesService.deleteImage('path/to/image.png')).rejects.toThrow(HttpException);
      await expect(imagesService.deleteImage('path/to/image.png')).rejects.toThrow('Failed to delete image from Firebase Storage');
    });
  });

  describe('listFilesInFolder', () => {
    it('should list all files in the specified folder', async () => {
      const files = [{ name: 'folder/file1.png' }, { name: 'folder/file2.png' }];
      const bucket = { getFiles: jest.fn().mockResolvedValue([files]) };
      const storage = { bucket: jest.fn().mockReturnValue(bucket) } as Partial<Storage> as Storage;

      jest.spyOn(firebaseService, 'getStorageInstance').mockReturnValue(storage);

      const result = await imagesService.listFilesInFolder('folder');
      expect(result).toEqual(['file1.png', 'file2.png']);
    });

    it('should throw an HttpException if it fails to list files in the folder', async () => {
      const bucket = { getFiles: jest.fn().mockRejectedValue(new Error('Error listing files')) };
      const storage = { bucket: jest.fn().mockReturnValue(bucket) } as Partial<Storage> as Storage;

      jest.spyOn(firebaseService, 'getStorageInstance').mockReturnValue(storage);

      await expect(imagesService.listFilesInFolder('folder')).rejects.toThrow(HttpException);
      await expect(imagesService.listFilesInFolder('folder')).rejects.toThrow('Error listing files in folder');
    });
  });
});
