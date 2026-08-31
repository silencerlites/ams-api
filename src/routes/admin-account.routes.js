import {
  Router
} from 'express';

import {
  approveAdmin
} from '../controllers/admin-account.controller.js';

import authenticate
  from '../middleware/authenticate.middleware.js';

import ensureActive
  from '../middleware/ensure-active.middleware.js';

import {
  requireRole
} from '../middleware/role.middleware.js';

import {
  RoleEnum
} from '../enums/role.enum.js';

const router = Router();

router.patch(
  '/:id/approve',

  authenticate,

  ensureActive,

  requireRole(
    RoleEnum.SUPER_ADMIN
  ),

  approveAdmin
);

export default router;