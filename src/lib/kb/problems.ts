// What a big ticket holds, problem by problem. causes.ts says where a report is filed; the desk's
// notes say what some reports describe. A flipped day and month moves a date by weeks or months,
// never by one day, so a report the desk read as a one-day move is a problem of its own,
// whatever its tenant.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

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

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | null {
  return oneDayMove.includes(r.id) ? 'one-day' : causeOf(r, t);
}

const tally = (values: string[]) =>
  values.reduce<Record<string, number>>((n, v) => ({ ...n, [v]: (n[v] ?? 0) + 1 }), {});

export function splitTicket(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const byProblem = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of uniqueById(reports).filter((r) => r.mergedInto === ticket)) {
    const problem = problemOf(r, tenantOf(r), oneDayMove) ?? 'unplaced';
    byProblem.set(problem, [...(byProblem.get(problem) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: [...rs].sort((a, b) => a.id.localeCompare(b.id)),
        filedAs: tally(rs.map((r) => causeOf(r, tenantOf(r)) ?? 'unplaced')),
        taggedAs: tally(rs.map((r) => r.meta.intakeTag)),
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

// Counts as "tag ×n · tag ×n", largest first.
export const counts = (n: Record<string, number>) =>
  Object.entries(n)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${key} ×${value}`)
    .join(' · ');
