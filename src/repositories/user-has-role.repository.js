// src/repositories/user-has-role.repository.js

import {
  db
} from '../config/firebase.js';

import UserHasRoleModel from '../models/user-has-role.model.js';


const COLLECTION =
  'user_has_roles';


class UserHasRoleRepository {

  async findByModel(
    modelType,
    modelId
  ) {
    const snapshot =
      await db
        .collection(COLLECTION)
        .where(
          'model_type',
          '==',
          modelType
        )
        .where(
          'model_id',
          '==',
          String(modelId)
        )
        .get();

    return snapshot.docs.map(
      doc =>
        UserHasRoleModel
          .fromFirestore(doc)
    );
  }


  async findByRole(
    roleId
  ) {
    const snapshot =
      await db
        .collection(COLLECTION)
        .where(
          'role_id',
          '==',
          Number(roleId)
        )
        .get();

    return snapshot.docs.map(
      doc =>
        UserHasRoleModel
          .fromFirestore(doc)
    );
  }


  async exists({
    role_id,
    model_type,
    model_id
  }) {
    const documentId =
      UserHasRoleModel
        .documentId({
          role_id,
          model_type,
          model_id
        });

    const doc =
      await db
        .collection(COLLECTION)
        .doc(documentId)
        .get();

    return doc.exists;
  }


  async create(
    payload,
    transaction = null
  ) {
    const userRole =
      payload instanceof UserHasRoleModel
        ? payload
        : new UserHasRoleModel(
            payload
          );

    const documentId =
      UserHasRoleModel
        .documentId({
          role_id:
            userRole.role_id,

          model_type:
            userRole.model_type,

          model_id:
            userRole.model_id
        });

    const ref =
      db
        .collection(COLLECTION)
        .doc(documentId);

    const data =
      userRole.toFirestore();

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

    return userRole;
  }


  async delete({
    role_id,
    model_type,
    model_id
  }) {
    const documentId =
      UserHasRoleModel
        .documentId({
          role_id,
          model_type,
          model_id
        });

    await db
      .collection(COLLECTION)
      .doc(documentId)
      .delete();
  }


  async deleteAllByModel(
    modelType,
    modelId
  ) {
    const roles =
      await this.findByModel(
        modelType,
        modelId
      );

    if (!roles.length) {
      return;
    }

    const batch =
      db.batch();

    for (const role of roles) {
      const documentId =
        UserHasRoleModel
          .documentId({
            role_id:
              role.role_id,

            model_type:
              role.model_type,

            model_id:
              role.model_id
          });

      const ref =
        db
          .collection(COLLECTION)
          .doc(documentId);

      batch.delete(ref);
    }

    await batch.commit();
  }


  async replaceRoles({
    model_type,
    model_id,
    role_ids
  }) {
    const currentRoles =
      await this.findByModel(
        model_type,
        model_id
      );

    const batch =
      db.batch();


    for (const role of currentRoles) {
      const currentDocumentId =
        UserHasRoleModel
          .documentId({
            role_id:
              role.role_id,

            model_type:
              role.model_type,

            model_id:
              role.model_id
          });

      batch.delete(
        db
          .collection(COLLECTION)
          .doc(currentDocumentId)
      );
    }


    for (const roleId of role_ids) {
      const userRole =
        new UserHasRoleModel({
          role_id:
            roleId,

          model_type,

          model_id
        });

      const documentId =
        UserHasRoleModel
          .documentId({
            role_id:
              userRole.role_id,

            model_type:
              userRole.model_type,

            model_id:
              userRole.model_id
          });

      batch.set(
        db
          .collection(COLLECTION)
          .doc(documentId),

        userRole.toFirestore()
      );
    }


    await batch.commit();
  }
}


export default new UserHasRoleRepository();