<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/problems';

  // One problem's reports from the ticket. `quote` shows what each reporter wrote.
  let { ticket, problem, quote = false }: { ticket: number; problem: Problem; quote?: boolean } = $props();

  const group = $derived(
    splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove).find((g) => g.problem === problem),
  );
</script>

{#if group}
  <details open={quote}>
    <summary><strong>{group.reports.length}</strong> <code>{problem}</code> reports from {group.tenants.length} tenants: {group.tenants.join(', ')}</summary>
    <table>
      <thead>
        <tr><th>report</th><th>received</th><th>tenant</th><th>channel</th>{#if quote}<th>what they wrote</th>{/if}</tr>
      </thead>
      <tbody>
        {#each group.reports as r (r.id)}
          <tr>
            <td><code>{r.id}</code></td>
            <td>{r.receivedAt.slice(0, 10)}</td>
            <td>{r.tenant}</td>
            <td>{r.channel}</td>
            {#if quote}<td>{r.body}</td>{/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </details>
{:else}
  <p class="none">No <code>{problem}</code> reports in #{ticket}.</p>
{/if}

<style>
  summary { cursor: pointer; }
  .none { color: var(--warn); font-weight: 600; }
</style>
