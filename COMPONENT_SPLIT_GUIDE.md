# Splitting Large Page Files in Next.js — A Practical Guide

> Written for the Vuna project. Covers the pattern used across
> `checkout/page.tsx`, `seller/products/page.tsx`, `register/seller/page.tsx`, and others.

---

## Why split a page file?

A Next.js page file starts simple — a form, some state, a submit handler.
Then requirements grow: more fields, location dropdowns, file uploads, validation.
Before long you have a 400-line file that is hard to read and hard to change.

The rule of thumb used in this project: **keep every file under ~200 lines**.
When a page crosses that, extract sections into sub-components.

The split does not change how the app works. It is purely a readability and
maintenance improvement.

---

## The folder structure

```
app/
  register/
    seller/
      page.tsx              ← the page (orchestrator)
      seller.module.css     ← shared styles
      ProofUpload.tsx       ← pre-existing component
      _types.ts             ← shared data shapes and constants
      _components/
        PersonalShopSection.tsx
        CategoryGrid.tsx
        LocationFields.tsx
        VideoUpload.tsx
```

### Why `_components/` with an underscore?

In Next.js App Router, every folder inside `app/` is a potential URL route.
A folder called `components/` would make Next.js try to look for a `page.tsx`
inside it and treat it as a route — which would fail.

The underscore prefix (`_components/`, `_types.ts`) is a Next.js convention
that tells the router: **skip this, it is private to the parent route**.
No URL is created, no route is registered.

---

## The `_types.ts` file

This file contains no React code — no `useState`, no JSX, no `'use client'`.
It is plain TypeScript that describes **data shapes** and **static constants**.

```ts
// Data shapes (interfaces)
export interface SellerFormState {
  name: string
  email: string
  categoryId: string
  // ...
}

// Constants that never change at runtime
export const EMPTY_FORM: SellerFormState = {
  name: '', email: '', categoryId: '', // ...
}

export const CATEGORY_DESC: Record<string, string> = {
  fashion: 'Clothing, accessories, traditional dress',
  art:     'Paintings, prints and visual art',
  // ...
}
```

**The rule:** anything that two or more files need to agree on goes in `_types.ts`.

Without it, you would copy-paste the same `interface SellerFormState` into both
`page.tsx` and `PersonalShopSection.tsx`. They would drift apart. One day you add
a field to the form and forget to add it to the copy — TypeScript won't catch it
because the two interfaces are separate declarations.

With `_types.ts`, there is one source of truth. Both files import from it.
Change it once, TypeScript tells you everywhere that needs updating.

---

## How a sub-component is structured

A sub-component does two things only:

1. **Renders** the UI using the data it is given via props
2. **Calls back** to the page when the user changes something

It never owns state that the page needs. It never fetches data. It never submits.

```tsx
// _components/PersonalShopSection.tsx

'use client'

import styles from '../seller.module.css'   // ← goes up one level with ../
import type { SellerFormState } from '../_types'

interface Props {
  form: SellerFormState                                          // read data in
  onChange: (field: keyof SellerFormState, value: string) => void  // changes out
}

export function PersonalShopSection({ form, onChange }: Props) {
  return (
    <>
      <input value={form.name} onChange={e => onChange('name', e.target.value)} />
      <input value={form.email} onChange={e => onChange('email', e.target.value)} />
      {/* ... */}
    </>
  )
}
```

Notice:
- It imports CSS with `../seller.module.css` (one level up, because it lives in `_components/`)
- It imports types with `../` for the same reason
- It never calls `useState` — the `form` value comes in, changes go out

---

## The `keyof SellerFormState` trick

```ts
onChange: (field: keyof SellerFormState, value: string) => void
```

`keyof SellerFormState` means TypeScript produces the union type:
`'name' | 'email' | 'password' | 'categoryId' | ...`

If you write `onChange('naem', value)` — a typo — TypeScript gives you a
compile error immediately. It does not wait for a runtime bug.

In `page.tsx`, one function handles every field:

```ts
const handleField = (field: keyof SellerFormState, value: string) => {
  setForm(f => ({ ...f, [field]: value }))
}
```

`{ ...f, [field]: value }` is a spread update — it copies the whole form object,
then overwrites just the one field that changed. Every other field stays the same.

---

## Where state lives and why

State lives in `page.tsx`. Always. Here is why.

The `handleSubmit` function needs to read:
- `form` (all 14 fields)
- `proofSlots` (the 4 photos)
- `videoFile`
- `hasDeclaration`

If any of these lived inside a child component, the page could not read them
at submission time. You would need to pass refs or add callbacks — which is
more complex than just keeping state in the page.

The sub-components are purely visual. They receive data, they call a callback
when something changes. That is their entire job.

The one exception in this project: `VideoUpload` owns its own `error` state
(validation messages like "file too large"). The page's `handleSubmit` never
needs to read the validation error — it only needs the `videoFile` if it exists.
So the error stays private to `VideoUpload`.

---

## Effects vs event handlers — the cascade problem

This is a common React Compiler error:

```
calling setState synchronously within an effect can trigger cascading renders
```

### What it means

A `useEffect` is designed to **synchronize with something external** — an API,
a timer, a browser event. It runs *after* the render is committed to the screen.

When you call `setState` synchronously inside an effect body, you trigger
another render immediately — a "cascade". The compiler flags this because
it is a sign that state management logic is in the wrong place.

### The wrong pattern (what was causing the error)

```ts
useEffect(() => {
  if (!form.provinceId) return
  setDistricts([])   // ← setState inside effect = cascade warning
  setCities([])      // ← same problem
  fetch(...)
    .then(data => setDistricts(data))
}, [form.provinceId])
```

The `setDistricts([])` and `setCities([])` are synchronous state calls at the
top of the effect. They trigger an immediate re-render, then the fetch triggers
another re-render when it completes. That is two renders for one user action.

### The correct pattern

**State clearing belongs in the event handler**, not the effect.
Effects should only do one thing: fetch data and set it.

```ts
// Event handler — correct place to clear cascaded state
const handleField = (field: keyof SellerFormState, value: string) => {
  if (field === 'provinceId') {
    setDistricts([])   // ← clearing here is fine — it is an event response
    setCities([])
    setForm(f => ({ ...f, provinceId: value, districtId: '', locationId: '' }))
  } else {
    setForm(f => ({ ...f, [field]: value }))
  }
}

// Effect — now it only synchronizes with the API (its actual purpose)
useEffect(() => {
  if (!form.provinceId) return
  fetch(`/api/locations/children?parentId=${form.provinceId}`)
    .then(r => r.json())
    .then(setDistricts)   // ← async setState is always fine
}, [form.provinceId])
```

### The mental model

React has a clear division:

| Trigger | Correct place for logic |
|--------|------------------------|
| User clicked something | Event handler (`onClick`, `onChange`) |
| Something external changed | `useEffect` |

If you find yourself clearing state at the top of an effect, that clearing
is actually a *response to a user action* — it belongs in the handler.
The effect's job is to react to `form.provinceId` changing, not to decide
what clearing should happen.

---

## Summary — the rules

| Rule | Why |
|------|-----|
| `_types.ts` holds all interfaces | Single source of truth, no drift |
| `_components/` uses underscore | Prevents Next.js from treating it as a route |
| Sub-components never own shared state | Page needs to read all state at submit time |
| `keyof InterfaceName` in props | TypeScript catches field name typos at compile time |
| State clearing goes in event handlers | Effects are for external synchronization, not cascades |
| Effects only fetch and set data | Keeps effects simple and compiler-warning-free |
| CSS imported with `../` | Sub-components live one folder deeper than the CSS file |
