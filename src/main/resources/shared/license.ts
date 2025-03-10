export type LicenseState = 'MISSING' | 'EXPIRED' | 'OK';

export type LicenseResponseState = {
    licenseState: LicenseState;
};

export type LicenseResponse = {
    status: number;
    contentType: string;
    body: LicenseResponseState | AiError;
};
