import * as authLib from '/lib/xp/auth';

export function isAuthenticated(): boolean {
    return authLib.getUser() != null;
}
