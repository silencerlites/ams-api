export const RoleEnum = Object.freeze({
  SUPER_ADMIN: 0,
  ADMIN: 1,
  CLIENT: 2,
  EMP: 3
});

export const RoleName = Object.freeze({
  [RoleEnum.SUPER_ADMIN]: 'Super Admin',
  [RoleEnum.ADMIN]: 'Admin',
  [RoleEnum.CLIENT]: 'Client',
  [RoleEnum.EMP]: 'Emp'
});

export const ROLE_VALUES = Object.values(RoleEnum);