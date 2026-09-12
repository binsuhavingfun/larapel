---
name: Generated client typings
description: TypeScript library requirements for the generated API client in this workspace
---

The generated browser API client can call `Headers.entries()`, so any composite TypeScript project that typechecks it must include both `dom` and `dom.iterable` in its `lib` compiler options.

**Why:** The default DOM library does not expose iterable methods on `Headers`, which makes an otherwise valid Orval output fail the workspace library typecheck.

**How to apply:** Keep `dom.iterable` alongside `dom` in the generated client package's TypeScript configuration when regenerating API clients.