// src/repositories/admin.repository.js

import {
  FieldValue
} from 'firebase-admin/firestore';

import {
  db
} from '../config/firebase.js';

import AdminModel from '../models/admin.model.js';

import AppError from '../errors/app-error.js';


const COLLECTION =
  'admins';


class AdminRepository {

  async findById(id) {
    const doc =
      await db
        .collection(COLLECTION)
        .doc(String(id))
        .get();

    return AdminModel.fromFirestore(
      doc
    );
  }


  async findByUid(uid) {
    const snapshot =
      await db
        .collection(COLLECTION)
        .where(
          'uid',
          '==',
          uid
        )
        .limit(1)
        .get();

    if (snapshot.empty) {
      return null;
    }

    return AdminModel.fromFirestore(
      snapshot.docs[0]
    );
  }


  async findByEmail(email) {
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const snapshot =
      await db
        .collection(COLLECTION)
        .where(
          'email',
          '==',
          normalizedEmail
        )
        .limit(1)
        .get();

    if (snapshot.empty) {
      return null;
    }

    return AdminModel.fromFirestore(
      snapshot.docs[0]
    );
  }


  async existsByEmail(email) {
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const snapshot =
      await db
        .collection(COLLECTION)
        .where(
          'email',
          '==',
          normalizedEmail
        )
        .limit(1)
        .get();

    return !snapshot.empty;
  }


  async create(
    payload,
    transaction = null
  ) {
    const admin =
      payload instanceof AdminModel
        ? payload
        : new AdminModel(payload);

    const ref =
      db
        .collection(COLLECTION)
        .doc(
          String(admin.id)
        );

    const data = {
      ...admin.toFirestore(),
      created_at:
        admin.created_at ??
        new Date(),
      updated_at:
        admin.updated_at ??
        new Date()
    };

    if (transaction) {
      transaction.create(
        ref,
        data
      );
    } else {
      await ref.create(
        data
      );
    }

    return admin;
  }


  async update(
    id,
    payload,
    transaction = null
  ) {
    const ref =
      db
        .collection(COLLECTION)
        .doc(String(id));

    const data = {
      ...payload,
      updated_at:
        new Date()
    };

    if (transaction) {
      transaction.update(
        ref,
        data
      );
    } else {
      await ref.update(
        data
      );
    }

    return this.findById(id);
  }


  async incrementTokenVersion(
    id
  ) {
    const ref =
      db
        .collection(COLLECTION)
        .doc(String(id));

    await ref.update({
      token_version:
        FieldValue.increment(1),

      updated_at:
        new Date()
    });

    return this.findById(id);
  }


  async softDelete(id) {
    const ref =
      db
        .collection(COLLECTION)
        .doc(String(id));

    await ref.update({
      is_active:
        false,

      deleted_at:
        new Date(),

      updated_at:
        new Date()
    });
  }


  async restore(id) {
    const ref =
      db
        .collection(COLLECTION)
        .doc(String(id));

    await ref.update({
      deleted_at:
        null,

      updated_at:
        new Date()
    });

    return this.findById(id);
  }


  async setActive(
    id,
    isActive
  ) {
    const ref =
      db
        .collection(COLLECTION)
        .doc(String(id));

    await ref.update({
      is_active:
        Boolean(isActive),

      updated_at:
        new Date()
    });

    return this.findById(id);
  }


  async updateEmailVerification(
    id,
    verified = true
  ) {
    const ref =
      db
        .collection(COLLECTION)
        .doc(String(id));

    await ref.update({
      email_verified_at:
        verified
          ? new Date()
          : null,

      updated_at:
        new Date()
    });

    return this.findById(id);
  }


  async deletePermanently(id) {
    await db
      .collection(COLLECTION)
      .doc(String(id))
      .delete();
  }
}


export default new AdminRepository();