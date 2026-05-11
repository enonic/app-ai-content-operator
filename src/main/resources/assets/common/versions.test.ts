import {version as reactVersion} from 'react';
import {version as reactDomVersion} from 'react-dom';
import {describe, expect, it} from 'vitest';

describe('React version compatibility', () => {
    it('should have matching react and react-dom versions', () => {
        expect(reactDomVersion).toBe(reactVersion);
    });
});
