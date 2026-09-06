export const ACCOUNT_STATUS = Object.freeze({
  PENDING: 0,
  ACTIVE: 1,
  DEACTIVATED: 2,
  LOCKED: 3,
  DELETED: 4
});


export const ACCOUNT_STATUS_VALUES =
  Object.values(ACCOUNT_STATUS);


export const ACCOUNT_STATUS_LABELS =
  Object.freeze({
    [ACCOUNT_STATUS.PENDING]:
      'Pending',

    [ACCOUNT_STATUS.ACTIVE]:
      'Active',

    [ACCOUNT_STATUS.DEACTIVATED]:
      'Deactivated',

    [ACCOUNT_STATUS.LOCKED]:
      'Locked',

    [ACCOUNT_STATUS.DELETED]:
      'Deleted'
  });