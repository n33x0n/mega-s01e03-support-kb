<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import filed from '#lib/data/tickets-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { counts, splitTicket } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const groups = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  type Filed = { number: number; state: 'open' | 'closed'; reason: string };
  const tickets = filed.tickets as Record<string, Filed | undefined>;
</script>

<p class="sum">
  <strong>{merged}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>filed as</th><th>tagged as</th><th>tenants</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const t = tickets[g.problem]}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td class="tags">{counts(g.filedAs)}</td>
        <td class="tags">{counts(g.taggedAs)}</td>
        <td>{g.tenants.length}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        {#if t}
          <td><a href="https://github.com/{filed.repo}/issues/{t.number}">#{t.number}</a></td>
          <td class:open={t.state === 'open'}>{t.state} · {t.reason}</td>
        {:else}
          <td colspan="2"><span class="none">no ticket yet</span></td>
        {/if}
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">Counted the way the desk counts: each report under the cause the tenant rule files it as. The <code>one-day</code> reports stay counted under <code>parser</code> too. Filed as: where the tenant rule puts a report. Tagged as: what intake guessed from the browser. Tickets live in <a href="https://github.com/{filed.repo}/issues">{filed.repo}</a>.</p>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .none, .open { color: var(--warn); font-weight: 600; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
