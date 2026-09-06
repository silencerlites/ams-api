// src/repositories/login-attempt.repository.js

import {
  db
} from '../config/firebase.js';

import LoginAttemptModel from '../models/login-attempt.model.js';


const COLLECTION =
  'user_has_login_attempts';


class LoginAttemptRepository {

  getRef(
    modelType,
    modelId
  ) {
    const documentId =
      LoginAttemptModel.documentId({
        model_type:
          modelType,

        model_id:
          modelId
      });

    return db
      .collection(COLLECTION)
      .doc(documentId);
  }


  async findByModel(
    modelType,
    modelId
  ) {
    const doc =
      await this
        .getRef(
          modelType,
          modelId
        )
        .get();

    return LoginAttemptModel
      .fromFirestore(doc);
  }


  async getOrCreate(
    modelType,
    modelId
  ) {
    const ref =
      this.getRef(
        modelType,
        modelId
      );

    return db.runTransaction(
      async transaction => {
        const doc =
          await transaction.get(ref);

        if (doc.exists) {
          return LoginAttemptModel
            .fromFirestore(doc);
        }

        const record =
          new LoginAttemptModel({
            model_type:
              modelType,

            model_id:
              modelId,

            attempts:
              0,

            last_attempt_at:
              null,

            locked_at:
              null
          });

        transaction.create(
          ref,
          record.toFirestore()
        );

        return record;
      }
    );
  }


  async incrementFailure(
    modelType,
    modelId
  ) {
    const ref =
      this.getRef(
        modelType,
        modelId
      );

    return db.runTransaction(
      async transaction => {
        const doc =
          await transaction.get(ref);

        const now =
          new Date();

        if (!doc.exists) {
          const record =
            new LoginAttemptModel({
              model_type:
                modelType,

              model_id:
                modelId,

              attempts:
                1,

              last_attempt_at:
                now,

              locked_at:
                null
            });

          transaction.create(
            ref,
            record.toFirestore()
          );

          return record;
        }

        const current =
          LoginAttemptModel
            .fromFirestore(doc);

        const attempts =
          Number(
            current.attempts || 0
          ) + 1;

        transaction.update(
          ref,
          {
            attempts,

            last_attempt_at:
              now,

            updated_at:
              now
          }
        );

        current.attempts =
          attempts;

        current.last_attempt_at =
          now;

        return current;
      }
    );
  }


  async lock(
    modelType,
    modelId,
    lockedAt = new Date()
  ) {
    const ref =
      this.getRef(
        modelType,
        modelId
      );

    const existing =
      await ref.get();

    const data = {
      model_type:
        modelType,

      model_id:
        String(modelId),

      locked_at:
        lockedAt,

      last_attempt_at:
        lockedAt,

      updated_at:
        lockedAt
    };

    if (!existing.exists) {
      const record =
        new LoginAttemptModel({
          ...data,
          attempts:
            0
        });

      await ref.create(
        record.toFirestore()
      );

      return record;
    }

    await ref.update(data);

    return this.findByModel(
      modelType,
      modelId
    );
  }


  async reset(
    modelType,
    modelId
  ) {
    const ref =
      this.getRef(
        modelType,
        modelId
      );

    const now =
      new Date();

    await ref.set(
      {
        model_type:
          modelType,

        model_id:
          String(modelId),

        attempts:
          0,

        last_attempt_at:
          null,

        locked_at:
          null,

        updated_at:
          now
      },
      {
        merge: true
      }
    );

    return this.findByModel(
      modelType,
      modelId
    );
  }


  async update(
    modelType,
    modelId,
    payload
  ) {
    const ref =
      this.getRef(
        modelType,
        modelId
      );

    await ref.update({
      ...payload,
      updated_at:
        new Date()
    });

    return this.findByModel(
      modelType,
      modelId
    );
  }


  async delete(
    modelType,
    modelId
  ) {
    await this
      .getRef(
        modelType,
        modelId
      )
      .delete();
  }
}


export default new LoginAttemptRepository();