import BaseModel from './base.model.js';

import {
  MODEL_TYPE_VALUES
} from '../constants/model-types.js';


const toDate = value => {
  if (!value) {
    return null;
  }

  if (
    typeof value.toDate ===
    'function'
  ) {
    return value.toDate();
  }

  return value;
};


export default class LoginOtpModel extends BaseModel {

  constructor({
    model_type,
    model_id,
    challenge_id,
    otp_hash,
    attempts = 0,
    resend_count = 0,
    last_resent_at = null,
    expires_at,
    verified_at = null,
    used_at = null,
    ip_address = null,
    user_agent = null,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    super();

    if (
      !MODEL_TYPE_VALUES.includes(
        model_type
      )
    ) {
      throw new Error(
        'Invalid model_type.'
      );
    }

    this.model_type =
      model_type;

    this.model_id =
      String(model_id);

    this.challenge_id =
      String(challenge_id);

    this.otp_hash =
      otp_hash;

    this.attempts =
      Number(attempts);

    this.resend_count =
      Number(resend_count);

    this.last_resent_at =
      toDate(last_resent_at);

    this.expires_at =
      toDate(expires_at);

    this.verified_at =
      toDate(verified_at);

    this.used_at =
      toDate(used_at);

    this.ip_address =
      ip_address;

    this.user_agent =
      user_agent;

    this.created_at =
      toDate(created_at);

    this.updated_at =
      toDate(updated_at);
  }


  toFirestore() {
    return LoginOtpModel.clean({
      model_type:
        this.model_type,

      model_id:
        this.model_id,

      challenge_id:
        this.challenge_id,

      otp_hash:
        this.otp_hash,

      attempts:
        this.attempts,

      resend_count:
        this.resend_count,

      last_resent_at:
        this.last_resent_at,

      expires_at:
        this.expires_at,

      verified_at:
        this.verified_at,

      used_at:
        this.used_at,

      ip_address:
        this.ip_address,

      user_agent:
        this.user_agent,

      created_at:
        this.created_at,

      updated_at:
        this.updated_at
    });
  }


  static fromFirestore(doc) {
    if (!doc.exists) {
      return null;
    }

    const data =
      doc.data();

    return new LoginOtpModel({
      ...data,

      challenge_id:
        data.challenge_id ??
        doc.id
    });
  }
}