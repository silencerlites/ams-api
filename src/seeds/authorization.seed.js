import {
  connectDatabase,
  disconnectDatabase
} from '../config/database.js';

import Role
  from '../models/role.model.js';

import Permission
  from '../models/permission.model.js';

import RoleHasPermission
  from '../models/role-has-permission.model.js';

import {
  RoleEnum,
  RoleName
} from '../enums/role.enum.js';

const roles = [
  {
    id: RoleEnum.SUPER_ADMIN,
    name:
      RoleName[
        RoleEnum.SUPER_ADMIN
      ],
    guard_name: 'api'
  },
  {
    id: RoleEnum.ADMIN,
    name:
      RoleName[
        RoleEnum.ADMIN
      ],
    guard_name: 'api'
  },
  {
    id: RoleEnum.CLIENT,
    name:
      RoleName[
        RoleEnum.CLIENT
      ],
    guard_name: 'api'
  },
  {
    id: RoleEnum.EMP,
    name:
      RoleName[
        RoleEnum.EMP
      ],
    guard_name: 'api'
  }
];

const permissions = [
  {
    id: 1,
    name: 'admin:view'
  },
  {
    id: 2,
    name: 'admin:create'
  },
  {
    id: 3,
    name: 'admin:update'
  },
  {
    id: 4,
    name: 'admin:approve'
  },
  {
    id: 5,
    name: 'admin:deactivate'
  },
  {
    id: 6,
    name: 'admin:delete'
  },
  {
    id: 7,
    name: 'role:view'
  },
  {
    id: 8,
    name: 'role:manage'
  },
  {
    id: 9,
    name: 'permission:view'
  },
  {
    id: 10,
    name: 'permission:manage'
  }
];

async function seed() {
  await connectDatabase();

  try {
    for (const role of roles) {
      await Role.findOneAndUpdate(
        {
          id: role.id
        },
        {
          $set: role
        },
        {
          upsert: true,
          returnDocument: 'after',
        }
      );
    }

    for (
      const permission of
      permissions
    ) {
      await Permission
        .findOneAndUpdate(
          {
            id:
              permission.id
          },
          {
            $set: {
              ...permission,
              guard_name:
                'api'
            }
          },
          {
            upsert: true,
            returnDocument: 'after',
          }
        );
    }

    /*
     * Super Admin gets all permissions.
     */
    for (
      const permission of
      permissions
    ) {
      await RoleHasPermission
        .findOneAndUpdate(
          {
            role_id:
              RoleEnum
                .SUPER_ADMIN,

            permission_id:
              permission.id
          },
          {
            $setOnInsert: {
              role_id:
                RoleEnum
                  .SUPER_ADMIN,

              permission_id:
                permission.id
            }
          },
          {
            upsert: true
          }
        );
    }

    console.log(
      'Authorization seed completed.'
    );
  } finally {
    await disconnectDatabase();
  }
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});