# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## This copy

MEGA.dev, S01E03 "what it shows". Everything above and the files under `src/` came in the
export unchanged; the [first commit](../../commit/cdab31b) is the export as it arrived. Added since:

- [`src/routes/kb/incidents/4471-split/+page.svx`](src/routes/kb/incidents/4471-split/+page.svx): the signed page
  about the problems #4471 holds.
- [`build/kb/incidents/4471-split/index.html`](build/kb/incidents/4471-split/index.html): that page as the desk
  sees it, rendered from the data. `build/` holds every kb page.
- `src/lib/kb/problems.ts`, `ProblemTable.svelte`, `ProblemReports.svelte`: the logic and views the page uses.
  `src/lib/data/tickets-4471.json`: which ticket each problem has.
- Tickets, one per problem: [#1 `parser`](../../issues/1), [#2 `hint`](../../issues/2),
  [#3 `one-day`](../../issues/3).
- `package.json`, `svelte.config.js`, `vite.config.js`, `src/app.html`, `src/routes/+layout.js`: the smallest
  SvelteKit + mdsvex app that renders the export. `npm ci && npm run build` writes `build/`.

The kb, its data and its story belong to the MEGA.dev course.
