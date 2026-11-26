# Assessment audit — 26 November 2026

Source: PDF requirements supplied in this conversation.

## Requirements

| Requirement | Status and evidence |
| --- | --- |
| Angular and four pages | Login, List, Add, Detail; lazy route tests and routing harness |
| Responsive design | All four pages tested in browser frame viewports 320/768/1024/1440 px |
| Functional hardcoded login | Credential, session, navigation, invalid-account, and blocked-storage tests |
| At least 100 dummy employees | Store initialization and unique-ID tests |
| Pagination and page-size selection | 10/25/50 choices; harness tests next page and changing page size |
| Sorting | Username harness test; headers for email/group/status/numeric salary |
| Search with two parameters and AND | Username plus group; regression tests and browser checks |
| Add navigation | List link and protected `/employees/add`, ordered before `:id` |
| Dummy Edit/Delete and distinct colors | Snackbar tests, unchanged memory/storage checks, yellow/red computed styles verified |
| All employee fields mandatory on Add | One test per mandatory field, whitespace and invalid-form checks |
| Birth datetime picker not beyond today | Native datetime-local, local end-of-day max, future/calendar-date tests |
| Valid email and numeric salary | Form and storage validation; invalid email and non-finite salary tests |
| Searchable group with 10 options | Material autocomplete input above options; harness tests option count, search, selection, invalid values |
| Save and Cancel | Persistence/navigation tests; Cancel does not add data |
| Detail and formatted data | All attributes displayed; Indonesian currency/date tests |
| OK and preserved previous search | Integration test follows real list → detail → OK routes and checks fields/results |
| Public repository with acceptable name | https://github.com/ammarff/employee-backoffice |
| README and environment/run instructions | Included; npm ci/start/test/build, demo credentials, behavior and limitations |

## Verification
- 95 tests passed, no skipped tests.
- Production build passed without warnings; initial bundle 303.64 kB.
- `npm audit --audit-level=high`: 0 known vulnerabilities.
- No debug console.log, TODO/FIXME, ts-ignore, eslint-disable, or skipped-test markers found in src.
- Mutation check: temporarily replaced the credential rejection OR with AND; both
  single-incorrect-credential tests failed. Restored the correct condition and reran the full suite.
- Previous UI review: Lighthouse accessibility/best practices 100 on all four pages.
- Browser on the production configuration: unauthenticated employee access redirected to login;
  login, filtered list, detail, OK, and Add loaded through lazy routes without console errors.
  Returning with OK retained both filter values and the single employee12 result.

## Review findings
- Fixed: sessionStorage read/write exceptions could interrupt login/guard execution.
  Guard now fails closed; failed login session writes show an actionable error.
- Fixed: initial eager routes exceeded the bundle warning budget; routes now load lazily.
- No critical blocker found in the exercised PDF flows after those fixes.
- Naming/readability follows feature folders and typed forms; some legacy formatting remains cosmetic.

## Remaining limits / submission steps
- Public repository uses an independent Git root at `employee-backoffice`; unrelated parent projects are excluded.
- No deployment was requested; hosting is not required by the PDF.
- Private learning notes and scratch exercises are excluded with .gitignore, not deleted locally.
- This is demo authentication and browser storage, not a production employee-data system.
- Sorting/page index/page size are not restored; PDF only requires retaining search.
- Same-page browser Back/Forward between different query strings is not synchronized into the form;
  reopening the list from detail restores search correctly.
- No manual screen-reader, physical-device, or clean-install verification performed.
- Visual beauty and code originality remain the assessor's judgment, not something automated tests can certify.
