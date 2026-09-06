// src/services/id-generator.service.js

import {
  db
} from '../config/firebase.js';

class IdGeneratorService {
  async generateAdminId(transaction = null) {
    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, '0');

    const prefix =
      `${year}${month}`;

    const counterRef =
      db
        .collection('counters')
        .doc(`ADMIN_${prefix}`);

    const generate = async tx => {
      const snapshot =
        await tx.get(counterRef);

      const sequence =
        snapshot.exists
          ? snapshot.data().sequence + 1
          : 1;

      tx.set(
        counterRef,
        {
          sequence,
          updated_at:
            new Date()
        },
        {
          merge: true
        }
      );

      return `${prefix}${String(
        sequence
      ).padStart(3, '0')}`;
    };

    if (transaction) {
      return generate(
        transaction
      );
    }

    return db.runTransaction(
      generate
    );
  }
}

export default new IdGeneratorService();