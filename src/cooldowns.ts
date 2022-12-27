type Cooldowns = {
  default: number;
  verificationRequest: number;
  newRequest: number;
  checkData: number;
  backupCodes: number;
  codeButton: number;
  deleteData: number;
};

export const cooldowns: Cooldowns = {
  default: 60000,
  verificationRequest: 60000,
  newRequest: 30000,
  checkData: 30000,
  backupCodes: 90000,
  codeButton: 30000,
  deleteData: 60000,
};
