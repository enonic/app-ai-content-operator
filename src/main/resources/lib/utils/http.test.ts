import {calcBackoffDelay, calcFullJitterWindow, parseRetryAfterMs} from './http';

describe('parseRetryAfter', () => {
    it('should return null if the header is not a string or number', () => {
        expect(parseRetryAfterMs(null)).toBe(null);
        expect(parseRetryAfterMs(undefined)).toBe(null);
        // @ts-expect-error {} is expected here
        expect(parseRetryAfterMs({})).toBe(null);
    });

    it('should return the number of milliseconds to wait before retrying for number', () => {
        expect(parseRetryAfterMs('10')).toBe(10_000);
        expect(parseRetryAfterMs(10)).toBe(10_000);
    });

    it('should return the number of milliseconds to wait before retrying for date string', () => {
        const value = 'Wed, 21 Oct 2045 07:28:00 GMT';
        const date = new Date(value);

        expect(parseRetryAfterMs(value)).toBeLessThanOrEqual(date.valueOf() - Date.now() + 10);
        expect(parseRetryAfterMs(date.toUTCString())).toBeLessThanOrEqual(date.valueOf() - Date.now() + 10);
    });
});

describe('calcRetryDelay', () => {
    const baseDelay = 500;
    const maxDelay = 15_000;

    it('should use retry-after header if it is a number (seconds)', () => {
        expect(calcBackoffDelay(1, {'retry-after': '10'})).toBe(10_000);
        expect(calcBackoffDelay(2, {'retry-after': '5'})).toBe(5_000);
    });

    it('should correctly use retry-after header even if it exceeds maxDelay (parsing step)', () => {
        expect(calcBackoffDelay(1, {'retry-after': '40'})).toBe(40_000);
    });

    it('should handle retry-after header with numeric value 0', () => {
        expect(calcBackoffDelay(1, {'retry-after': '0'})).toBe(0);
    });

    it('should return 0 if retry-after header is a past date string', () => {
        const pastDate = new Date(Date.now() - 10_000);
        expect(calcBackoffDelay(1, {'retry-after': pastDate.toUTCString()})).toBe(0);
    });

    it('should correctly use retry-after header (date string) even if it exceeds maxDelay (parsing step)', () => {
        const futureDate = new Date(Date.now() + 40_000);
        const delay = calcBackoffDelay(1, {'retry-after': futureDate.toUTCString()});
        expect(delay).toBeGreaterThanOrEqual(39_000);
        expect(delay).toBeLessThanOrEqual(40_000);
    });

    it('should return exponential backoff delay if no retry-after header', () => {
        expect(calcBackoffDelay(1, null)).toBe(baseDelay);
        expect(calcBackoffDelay(2, {})).toBe(baseDelay * 2);
        expect(calcBackoffDelay(3, {someHeader: 'value'})).toBe(baseDelay * 4);
    });

    it('should cap exponential backoff delay at maxDelay', () => {
        expect(calcBackoffDelay(5, null)).toBe(8_000);
        expect(calcBackoffDelay(6, null)).toBe(maxDelay);
        expect(calcBackoffDelay(7, null)).toBe(maxDelay);
    });

    it('should use retry-after header if it is a valid future date string', () => {
        const futureDate = new Date(Date.now() + 10_000);
        const delay = calcBackoffDelay(1, {'retry-after': futureDate.toUTCString()});
        expect(delay).toBeGreaterThanOrEqual(9_000);
        expect(delay).toBeLessThanOrEqual(10_000);
    });

    it('should ignore invalid retry-after header and use exponential backoff', () => {
        expect(calcBackoffDelay(1, {'retry-after': 'invalid-value'})).toBe(baseDelay);
    });

    it('should calculate for attempt 0 if provided (though typically starts at 1)', () => {
        expect(calcBackoffDelay(0, null)).toBe(baseDelay / 2);
        expect(calcBackoffDelay(0, undefined)).toBe(baseDelay / 2);
        expect(calcBackoffDelay(0, {})).toBe(baseDelay / 2);
    });
});

describe('calcFullJitterWindow', () => {
    let mathRandomSpy: jest.SpyInstance;

    beforeEach(() => {
        mathRandomSpy = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
        mathRandomSpy.mockRestore();
    });

    it('should return 0 when Math.random is 0', () => {
        mathRandomSpy.mockReturnValue(0);
        expect(calcFullJitterWindow(1_000)).toBe(0);
    });

    it('should return half of the delay when Math.random is 0.5 (for delay < cap)', () => {
        mathRandomSpy.mockReturnValue(0.5);
        expect(calcFullJitterWindow(1_000)).toBe(500);
    });

    it('should return the full delay when Math.random is 1 (approaching 1, for delay < cap)', () => {
        mathRandomSpy.mockReturnValue(0.999);
        expect(calcFullJitterWindow(1_000)).toBe(999);
    });

    it('should use the cap if delay is greater than the cap', () => {
        const jitterCap = 5_000;
        mathRandomSpy.mockReturnValue(0.5);
        expect(calcFullJitterWindow(10_000)).toBe(jitterCap * 0.5);
    });

    it('should return a value within [0, delay) if delay is less than cap', () => {
        const delay = 2000;
        mathRandomSpy.mockReturnValue(0.25);
        expect(calcFullJitterWindow(delay)).toBe(delay * 0.25);
        mathRandomSpy.mockReturnValue(0.75);
        expect(calcFullJitterWindow(delay)).toBe(delay * 0.75);
    });

    it('should return a value within [0, cap) if delay is greater than cap', () => {
        const delay = 8_000;
        const cap = 5_000;
        mathRandomSpy.mockReturnValue(0.25);
        expect(calcFullJitterWindow(delay)).toBe(cap * 0.25);
        mathRandomSpy.mockReturnValue(0.75);
        expect(calcFullJitterWindow(delay)).toBe(cap * 0.75);
    });

    it('should handle delay of 0', () => {
        mathRandomSpy.mockReturnValue(0.5);
        expect(calcFullJitterWindow(0)).toBe(0);
    });
});
