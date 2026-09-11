---
"@avatar-generator/core": patch
---

Releases now publish with npm trusted publishing (OIDC) instead of a long-lived
`NPM_TOKEN`. Nothing secret is stored in the repository: the workflow exchanges a
short-lived GitHub OIDC token for registry credentials, and provenance
attestations are generated automatically.
