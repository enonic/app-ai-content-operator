// Runtime stub for `/lib/license` used by vitest.
const stub = {
  installLicense: () => undefined,
  uninstallLicense: () => undefined,
  validateLicense: () => null,
};

export default stub;
export const installLicense = stub.installLicense;
export const uninstallLicense = stub.uninstallLicense;
export const validateLicense = stub.validateLicense;
