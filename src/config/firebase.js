// src/config/firebase.js

import {
  cert,
  getApps,
  initializeApp
} from 'firebase-admin/app';

import {
  getAuth
} from 'firebase-admin/auth';

import {
  getFirestore
} from 'firebase-admin/firestore';

import env from './env.js';


const firebaseApp =
  getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId:
            env.firebase.projectId,

          clientEmail:
            env.firebase.clientEmail,

          privateKey:
           env.firebase.privateKey.replace(/\\n/g, '\n')
        })
      });


const firebaseAuth =
  getAuth(firebaseApp);


const db =
  getFirestore(firebaseApp);


export {
  firebaseApp,
  firebaseAuth,
  db
};

export default db;