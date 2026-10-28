// What a big ticket holds, problem by problem, counted the way the desk counts: groupByCause and
// readAs from causes.ts. A report stays counted where the tenant rule files it. The reports the desk
// read as a one-day move (desk-notes.json) are also a problem of their own: a flipped day and month
// moves a date by weeks or months, never by one day.
import { groupByCause, readAs, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day';

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  // Where causes.ts files these reports: cause → count.
  filedAs: Record<string, number>;
  // What intake tagged them as: tag → count.
  taggedAs: Record<string, number>;
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
};

function describe(
  problem: ProblemGroup['problem'],
  reports: Report[],
  filedAs: Record<string, number>,
): ProblemGroup {
  const days = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: [...reports].sort((a, b) => a.id.localeCompare(b.id)),
    filedAs,
    taggedAs: reports.reduce<Record<string, number>>(
      (n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }),
      {},
    ),
    tenants: [...new Set(reports.map((r) => r.tenant))].sort(),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function splitTicket(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const byCause = groupByCause(merged, tenantOf);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const movedFiled = Object.fromEntries(
    byCause.map((g) => [g.cause, readAs(g, oneDayMove)] as const).filter(([, n]) => n > 0),
  );
  return [
    ...byCause.map((g) => describe(g.cause, g.reports, { [g.cause]: g.reports.length })),
    ...(moved.length ? [describe('one-day', moved, movedFiled)] : []),
  ];
}

// Counts as "tag ×n · tag ×n", largest first.
export const counts = (n: Record<string, number>) =>
  Object.entries(n)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${key} ×${value}`)
    .join(' · ');
