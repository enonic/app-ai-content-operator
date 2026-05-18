---
paths:
  - '**/*.test.{ts,tsx}'
  - '**/*.spec.{ts,tsx}'
---

# Testing Rules

Vitest + Testing Library. Use `vi.*` (`vi.fn`, `vi.spyOn`, `vi.mock`, `vi.clearAllMocks`) — never `jest.*`.

## Test data via builders

```ts
function buildUser(overrides?: Partial<User>): User {
  return { id: 'user_123', email: 'test@example.com', name: 'Test User', ...overrides };
}
```

## Reset mocks between tests

```ts
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});
```

## R3F components — mock the canvas

```ts
import {vi} from 'vitest';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({camera: {}, gl: {}, scene: {}}),
}));
```

Test 3D logic separately from rendering — extract pure functions or test stores directly:

```ts
import { renderHook, act } from '@testing-library/react';
import { $playerPosition } from '@/stores/game';

it('updates position from store', () => {
  const { result } = renderHook(() => useStore($playerPosition));
  act(() => {
    $playerPosition.set([1, 0, 0]);
  });
  expect(result.current).toEqual([1, 0, 0]);
});
```
