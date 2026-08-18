# Security Policy

## Supported versions

uSync.Forms ships one release line per Umbraco major, matching the uSync release it
plugs into. Fixes go to the current line, and to the previous one where the issue is
serious and the fix is practical.

| Version | Branch | Supported |
| --- | --- | --- |
| 17.x | `v17/main` | Yes |
| 16.x | `v16/main` | Yes |
| 15.x and earlier | — | No |

## Reporting a vulnerability

Please **do not** open a public issue for a security problem.

Email **info@jumoo.co.uk** with a description of the issue, the version affected, and
steps to reproduce it. We'll acknowledge within a few working days and keep you
updated as we work on it.

uSync.Forms reads and writes Umbraco Forms definitions to and from disk, and re-imports
those files (including on server start), so if the issue involves file paths, archive
extraction, or XML/JSON parsing of a file that isn't fully trusted, say so - those get
sequenced first.
