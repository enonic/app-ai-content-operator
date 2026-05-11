// Runtime stub for `/lib/http-client` used by vitest. Tests that exercise
// request paths should mock these functions via vi.mock as needed.
const stub = {
    request: () => ({
        status: 0,
        message: '',
        headers: {},
        cookies: {},
        contentType: 'application/json',
        body: '',
    }),
};

export default stub;
export const request = stub.request;
