import {
  FieldValue
} from 'firebase-admin/firestore';

import {
  db
} from '../config/firebase.js';

import LoginOtpModel from '../models/login-otp.model.js';


const COLLECTION =
  'login_otps';


class LoginOtpRepository {

  getRef(challengeId) {
    return db
      .collection(COLLECTION)
      .doc(String(challengeId));
  }


  async findByChallengeId(
    challengeId
  ) {
    const doc =
      await this
        .getRef(challengeId)
        .get();

    return LoginOtpModel
      .fromFirestore(doc);
  }


  async create(payload) {
    const otp =
      payload instanceof LoginOtpModel
        ? payload
        : new LoginOtpModel(payload);

    await this
      .getRef(otp.challenge_id)
      .create(
        otp.toFirestore()
      );

    return otp;
  }


  async update(
    challengeId,
    payload
  ) {
    const ref =
      this.getRef(challengeId);

    await ref.update({
      ...payload,

      updated_at:
        FieldValue.serverTimestamp()
    });

    return this
      .findByChallengeId(
        challengeId
      );
  }


  async invalidateUnused(
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
        .where(
          'used_at',
          '==',
          null
        )
        .get();

    if (snapshot.empty) {
      return 0;
    }

    const batch =
      db.batch();

    snapshot.docs.forEach(
      doc => {
        batch.update(
          doc.ref,
          {
            used_at:
              FieldValue.serverTimestamp(),

            updated_at:
              FieldValue.serverTimestamp()
          }
        );
      }
    );

    await batch.commit();

    return snapshot.size;
  }


  async incrementAttempts(
    challengeId
  ) {
    const ref =
      this.getRef(challengeId);

    return db.runTransaction(
      async transaction => {
        const doc =
          await transaction.get(ref);

        if (!doc.exists) {
          return null;
        }

        const challenge =
          LoginOtpModel
            .fromFirestore(doc);

        const attempts =
          Number(
            challenge.attempts ?? 0
          ) + 1;

        transaction.update(
          ref,
          {
            attempts,

            updated_at:
              FieldValue.serverTimestamp()
          }
        );

        challenge.attempts =
          attempts;

        return challenge;
      }
    );
  }


  async markUsed(
    challengeId,
    payload = {}
  ) {
    return this.update(
      challengeId,
      {
        ...payload,

        used_at:
          FieldValue.serverTimestamp()
      }
    );
  }


  async markVerified(
    challengeId
  ) {
    return this.update(
      challengeId,
      {
        verified_at:
          FieldValue.serverTimestamp(),

        used_at:
          FieldValue.serverTimestamp()
      }
    );
  }


  async delete(
    challengeId
  ) {
    await this
      .getRef(challengeId)
      .delete();
  }
}


export default new LoginOtpRepository();