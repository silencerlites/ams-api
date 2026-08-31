import Counter from '../models/counter.model.js';

class IdGeneratorService {
  async generate({ namespace, session = null, digits = 3 }) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}${month}`;
    const key = `${namespace}:${prefix}`;
    const counter = await Counter.findOneAndUpdate(
      { key },
      { $inc: { sequence: 1 } },
      { upsert: true, returnDocument: 'after', session, setDefaultsOnInsert: true }
    );

    const sequence = String(counter.sequence).padStart(digits, '0');
    return `${prefix}${sequence}`;
  }

  generateAdminId(session = null) {
    return this.generate({namespace: 'ADMIN', session, digits: 3});
  }

  generateClientId(session = null) {
    return this.generate({namespace: 'CLIENT', session, digits: 3});
  }

  generateEmployeeId(session = null) {
    return this.generate({namespace: 'EMP', session, digits: 3});
  }
}

export default new IdGeneratorService();