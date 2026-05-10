---
paths:
  - '**/*.tsx'
---

# Tailwind Rules

Tailwind v4. Use the local `cn` utility (clsx + tailwind-merge) for class composition.

## `cva` for components with 2+ variant dimensions

Hand-rolled `Record<Variant, string>` lookups are the wrong default for variant-style components. Use `class-variance-authority`:

```ts
const buttonVariants = cva('px-4 py-2 rounded font-medium transition-colors', {
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      ghost: 'bg-transparent hover:bg-neutral-100',
    },
    size: {
      sm: 'text-sm px-3 py-1',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    },
  },
  defaultVariants: {variant: 'primary', size: 'md'},
});
```

For a single boolean (e.g. only `disabled`), `cn` is fine.

## `size-*` for equal width and height

```tsx
<Icon className='size-4' /> // not h-4 w-4
```

## Semantic color tokens before raw palette

The project defines semantic tokens (`bg-primary`, `text-subtle`, `border-accent`, `bg-surface-neutral-hover`, etc.). Use them. Raw `bg-blue-600` is a fallback when no semantic token fits — flag it for token review.

## Inline `style` only for runtime-dynamic values

If the value can be expressed as a class (including arbitrary `[...]` syntax), use a class. `style={{...}}` is reserved for values not knowable at build time (computed dimensions, user-supplied colors, animation transforms with computed offsets).

```tsx
// wrong — inline style for static layout
<div className='p-4' style={{margin: '10px'}} />

// right — runtime-computed value
<div style={{transform: `translateY(${scrollOffset}px)`}} />
```

## Style off Radix `data-*` attributes, not className conditions

```tsx
// right
<Tabs.Trigger className='border-b border-transparent data-[state=active]:border-accent' />

// wrong
<Tabs.Trigger className={cn(active && 'border-b border-accent')} />
```
