export const AccountStatus = Object.freeze({
  PENDING: 0,
  ACTIVE: 1,
  DEACTIVATED: 2,
  LOCKED: 3,
  DELETED: 4
});

export const AccountStatusName = Object.freeze({
  [AccountStatus.PENDING]: 'Pending',
  [AccountStatus.ACTIVE]: 'Active',
  [AccountStatus.DEACTIVATED]: 'Deactivated',
  [AccountStatus.LOCKED]: 'Locked',
  [AccountStatus.DELETED]: 'Deleted'
});

export const ACCOUNT_STATUS_VALUES = Object.values(AccountStatus);

export function statusIsActive(status) {
  return status === AccountStatus.ACTIVE;
}