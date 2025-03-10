declare global {
    interface XpLibraries {
        '/lib/license': typeof import('./license');
    }
}

export interface ValidateLicenseParams {
    appKey: string;
}

export interface LicenseDetails {
    expired: boolean;
}

export interface License {
    validateLicense: (params: ValidateLicenseParams) => LicenseDetails;
}

declare const license: License;

export default license;
