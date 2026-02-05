import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';

export class FirebaseAdmin {
    static init(config:any) {
        admin.initializeApp({
            credential: admin.credential.cert(config)})
    }
}