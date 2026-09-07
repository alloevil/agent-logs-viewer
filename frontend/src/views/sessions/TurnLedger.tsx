// Per-turn ledger: the answer to "why did this session take 40 minutes / cost $3".
// One row per user turn; bars are proportional to the session maximum so the
// expensive turn is visible without reading numbers. Clicking a row jumps to
// the user message that started it.

import { useMemo, useState } from 'react';
import type { SessionMessage } from '@/api/types';
import { buildTurnLedger, formatCost, formatDurationCompact } from '@/lib/pure';
import { cn } from '@/lib/utils';
import { formatNumber } from './lib';

type SortKey = 'index' | 'durationMs' | 'tokens' | 'cost';

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full rounded bg-border/60">
      <div className={cn('h-1.5 rounded', className)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TurnLedger({
  messages,
  onScrollToMessage,
}: {
  messages: SessionMessage[];
  onScrollToMessage: (id: string) => void;
}) {
  const ledger = useMemo(() => buildTurnLedger(messages), [messages]);
  const [sort, setSort] = useState<SortKey>('index');

  const rows = useMemo(() => {
    const withTokens = ledger.rows.map((r) => ({
      ...r,
      tokens: r.inputTokens + r.outputTokens + r.cacheReadTokens + r.cacheWriteTokens,
    }));
    if (sort === 'index') return withTokens;
    return [...withTokens].sort((a, b) => b[sort] - a[sort]);
  }, [ledger, sort]);

  if (ledger.rows.length < 2) return null;

  const maxMs = Math.max(...rows.map((r) => r.durationMs), 0);
  const maxTok = Math.max(...rows.map((r) => r.tokens), 0);
  const maxCost = Math.max(...rows.map((r) => r.cost), 0);
  const { totals } = ledger;

  const header = (key: SortKey, label: string, title: string) => (
    <button
      type="button"
      title={title}
      onClick={() => setSort(key)}
      className={cn('text-left hover:text-foreground', sort === key ? 'text-foreground' : 'text-muted-foreground')}
    >
      {label}
      {sort === key && key !== 'index' ? ' ▾' : ''}
    </button>
  );

  return (
    <div data-testid="turn-ledger">
      <div className="mb-1 flex items-baseline justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Per-turn ledger
        </div>
        <div className="text-[10px] text-muted-foreground">
          {ledger.rows.length} turns · {formatDurationCompact(totals.durationMs)}
          {ledger.hasUsage ? ` · ${formatNumber(totals.tokens)} tok` : ''}
          {ledger.hasCost ? ` · ${formatCost(totals.cost)}` : ''}
        </div>
      </div>
      <div
        className="grid gap-x-3 gap-y-1 text-[11px]"
        style={{
          gridTemplateColumns: `2rem minmax(0,1fr) 7rem${ledger.hasUsage ? ' 7rem' : ''}${ledger.hasCost ? ' 6rem' : ''}`,
        }}
      >
        <div>{header('index', '#', 'Session order')}</div>
        <div className="text-muted-foreground">turn</div>
        <div>{header('durationMs', 'time', 'Wall-clock from the user message to the last agent message of the turn')}</div>
        {ledger.hasUsage ? (
          <div>{header('tokens', 'tokens', 'input + output + cache read + cache write, summed over the turn')}</div>
        ) : null}
        {ledger.hasCost ? <div>{header('cost', 'cost', 'Reported cost summed over the turn')}</div> : null}

        {rows.map((r) => (
          <button
            type="button"
            key={r.index}
            onClick={() => r.messageId && onScrollToMessage(r.messageId)}
            title={`${r.toolCalls} tool calls${r.toolErrors ? `, ${r.toolErrors} errors` : ''} — click to jump`}
            className="contents text-left"
          >
            <div className="text-muted-foreground tabular-nums">{r.index}</div>
            <div className="min-w-0 truncate">
              {r.toolErrors > 0 ? <span className="text-destructive">✕ </span> : null}
              {r.text}
              {r.toolCalls > 0 ? <span className="text-muted-foreground"> · {r.toolCalls} tools</span> : null}
            </div>
            <div>
              <div className="tabular-nums">{formatDurationCompact(r.durationMs)}</div>
              <Bar value={r.durationMs} max={maxMs} className="bg-[#e3b341]" />
            </div>
            {ledger.hasUsage ? (
              <div>
                <div className="tabular-nums">{formatNumber(r.tokens)}</div>
                <Bar value={r.tokens} max={maxTok} className="bg-primary/70" />
              </div>
            ) : null}
            {ledger.hasCost ? (
              <div>
                <div className="tabular-nums">{formatCost(r.cost)}</div>
                <Bar value={r.cost} max={maxCost} className="bg-[#3fb950]" />
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
