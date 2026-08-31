import {
  connectDatabase,
  disconnectDatabase
} from '../config/database.js';

import Admin
  from '../models/admin.model.js';

import AdminProfile
  from '../models/admin-profile.model.js';

import UserHasRole
  from '../models/user-has-role.model.js';

import idGeneratorService
  from '../services/id-generator.service.js';

import accountStatusService
  from '../services/account-status.service.js';

import {
  MODEL_TYPES
} from '../constants/model-types.js';

import {
  AccountStatus
} from '../enums/account-status.enum.js';

import {
  RoleEnum
} from '../enums/role.enum.js';

async function seed() {
  await connectDatabase();

  try {
    const email =
      'superadmin@example.com';

    let admin =
      await Admin.findOne({
        email
      });

    if (admin) {
      console.log(
        'Super Administrator already exists.'
      );

      return;
    }

    const id =
      await idGeneratorService
        .generateAdminId();

    admin =
      await Admin.create({
        id,
        email,
        password:
          'ChangeMe!Immediately123',
        is_active: true,
        email_verified_at:
          new Date()
      });

    await AdminProfile.create({
      admin_id: admin.id,
      first_name: 'Super',
      last_name: 'Administrator'
    });

    await accountStatusService
      .setStatus({
        modelType:
          MODEL_TYPES.ADMIN,
        modelId:
          admin.id,
        status:
          AccountStatus.ACTIVE
      });

    await UserHasRole.create({
      role_id:
        RoleEnum.SUPER_ADMIN,

      model_type:
        MODEL_TYPES.ADMIN,

      model_id:
        admin.id
    });

    console.log(
      `Super Admin created: ${admin.id}`
    );
  } finally {
    await disconnectDatabase();
  }
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});