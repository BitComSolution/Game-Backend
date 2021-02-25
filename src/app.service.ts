import { Injectable } from '@nestjs/common';
import {
  FirebaseAuthenticationService,
  FirebaseFirestoreService,
} from '@aginix/nestjs-firebase-admin/dist';
import { UserDto } from './dto/user.dto';
import { doc } from 'prettier';
import { log } from 'util';
import { userInfo } from 'os';
import { Runtime } from 'inspector';

@Injectable()
export class AppService {
  constructor(
    private firebaseAuth: FirebaseAuthenticationService,
    private firebase: FirebaseFirestoreService,
  ) {}

  async getUsers() {
    return this.firebaseAuth.listUsers();
  }

  async getUser(userId: string) {
    const user = await this.firebaseAuth.getUser(userId);
    const info = await this.getInfo(user.uid);
    return { ...user, info };
  }

  async updateUser(dto: UserDto): Promise<any> {
    const userInfo: any = await this.firebase
      .collection('userFields')
      .where('name', '==', dto.name)
      .get()
      .then((collection) => {
        if (!collection.empty) {
          return collection.docs[0];
        }
        return false;
      });

    if (userInfo) {
      await this.firebase
        .collection('userFields')
        .doc(userInfo.id)
        .update({
          score: userInfo.data().score + dto.score,
        });
      return this.getUser(userInfo.data().userId);
    } else {
      return this.createUser(dto);
    }
  }

  async createUser(dto: UserDto): Promise<any> {
    const user = await this.firebaseAuth.createUser({});
    const info = await this.addInfo(user, dto);
    return { ...user, info };
  }

  async addInfo(user, dto) {
    const info = await this.firebase.collection('userFields').add({
      userId: user.uid,
      name: dto.name,
      score: dto.score,
    });
    const data = await info.get();
    return data.data();
  }

  async getInfo(userId: string): Promise<any> {
    return this.firebase
      .collection('userFields')
      .where('userId', '==', userId)
      .get()
      .then((collection) => {
        if (!collection.empty) {
          return collection.docs[0].data();
        }
        return false;
      });
  }
}
