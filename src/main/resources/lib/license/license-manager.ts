import licenseLib, {LicenseDetails} from '/lib/license';
import {ERRORS} from '../../shared/errors';
import {LicenseState} from '../../shared/license';

const subscriptionKey = 'enonic.platform.subscription';

function getLicenseDetails(): LicenseDetails {
    const params = {
        appKey: subscriptionKey,
    };

    return licenseLib.validateLicense(params);
}

export function getLicenseState(): Try<LicenseState> {
    try {
        const licenseDetails = getLicenseDetails();

        if (!licenseDetails) {
            return ['MISSING', null];
        }

        return [licenseDetails.expired ? 'EXPIRED' : 'OK', null];
    } catch (e) {
        log.error('Failed to get license state', e);
        return [null, ERRORS.LICENSE_ERROR_UNKNOWN];
    }
}
