import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports:[FirebaseModule],
  providers: [ImagesService],
  exports:[ImagesService],
})
export class ImagesModule {}
