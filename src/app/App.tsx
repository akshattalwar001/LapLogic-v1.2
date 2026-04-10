'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  Wallet,
  Flag,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Gauge,
  Timer,
  Zap,
  Radio,
  CircleDot,
  ArrowUpRight,
  Minus,
} from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface Driver {
  id: string;
  name: string;
  abbr: string;
  number: number;
  team: string;
  teamColor: string;
  cost: number;
  form: 'up' | 'down' | 'stable';
  recentPoints: number;
  delta: number;
}

interface Constructor {
  id: string;
  name: string;
  abbr: string;
  cost: number;
  form: 'up' | 'down' | 'stable';
  color: string;
}

interface Position {
  id: string;
  type: string;
  label: string;
  description: string;
  staked: number;
  potentialPayout: number;
  race: string;
  status: 'live' | 'pending' | 'settled';
}

interface Standing {
  rank: number;
  address: string;
  points: number;
  change: number;
  isCurrentUser?: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DRIVERS: Driver[] = [
  { id: '1', name: 'Max Verstappen',  abbr: 'VER', number: 1,  team: 'Red Bull',   teamColor: '#3671c6', cost: 32.5, form: 'up',     recentPoints: 125, delta: 12 },
  { id: '2', name: 'Charles Leclerc', abbr: 'LEC', number: 16, team: 'Ferrari',    teamColor: '#e8002d', cost: 28.0, form: 'stable', recentPoints: 98,  delta: 0  },
  { id: '3', name: 'Lewis Hamilton',  abbr: 'HAM', number: 44, team: 'Ferrari',    teamColor: '#e8002d', cost: 30.5, form: 'up',     recentPoints: 112, delta: 8  },
  { id: '4', name: 'Lando Norris',    abbr: 'NOR', number: 4,  team: 'McLaren',    teamColor: '#ff8000', cost: 24.5, form: 'up',     recentPoints: 87,  delta: 5  },
  { id: '5', name: 'Carlos Sainz',    abbr: 'SAI', number: 55, team: 'Williams',   teamColor: '#64c4ff', cost: 22.0, form: 'down',   recentPoints: 76,  delta: -9 },
];

const MOCK_CONSTRUCTOR: Constructor = {
  id: 'c1',
  name: 'Red Bull Racing',
  abbr: 'RBR',
  cost: 35.0,
  form: 'up',
  color: '#3671c6',
};

const MOCK_POSITIONS: Position[] = [
  {
    id: 'p1',
    type: 'Podium',
    label: 'P1 Finish',
    description: 'Verstappen takes the win at Monaco',
    staked: 500,
    potentialPayout: 1250,
    race: 'Monaco GP — Rd. 08',
    status: 'live',
  },
  {
    id: 'p2',
    type: 'Top 5',
    label: 'Top 5 Finish',
    description: 'Norris inside the top five',
    staked: 300,
    potentialPayout: 600,
    race: 'Monaco GP — Rd. 08',
    status: 'pending',
  },
  {
    id: 'p3',
    type: 'Fastest Lap',
    label: 'Purple Sector',
    description: 'Leclerc sets the fastest lap',
    staked: 200,
    potentialPayout: 800,
    race: 'Monaco GP — Rd. 08',
    status: 'pending',
  },
];

const MOCK_STANDINGS: Standing[] = [
  { rank: 1,   address: '0xA7B...92F', points: 2847, change: 0  },
  { rank: 2,   address: '0x3C4...1E8', points: 2801, change: 1  },
  { rank: 3,   address: '0x8D1...4B3', points: 2765, change: -1 },
  { rank: 402, address: '0x1A2...3F4', points: 1542, change: 3, isCurrentUser: true },
];

// ============================================================================
// UTILS
// ============================================================================

function getTimeRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

// ============================================================================
// LOGO
// ============================================================================

function LapLogicLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const isSmall = size === 'sm';
  return (
    <div className={`flex items-center gap-${isSmall ? '2' : '3'}`}>
      {/* Monogram mark */}
      <div className="relative">
        <div
          className={`${isSmall ? 'w-8 h-8' : 'w-10 h-10'} bg-[#e8002d] flex items-center justify-center`}
          style={{ clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)' }}
        >
          <span
            className={`font-black text-white tracking-tighter select-none ${isSmall ? 'text-xs' : 'text-sm'}`}
            style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05em' }}
          >
            LL
          </span>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-black text-white tracking-tight ${isSmall ? 'text-base' : 'text-lg'}`}>
          Lap<span className="text-[#e8002d]">Logic</span>
        </span>
        {!isSmall && (
          <span className="text-[10px] font-mono text-[#444] uppercase tracking-[0.2em] mt-0.5">
            2026 Season
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// WALLET BADGE
// ============================================================================

function WalletBadge({ address, balance }: { address: string; balance: number }) {
  // TODO: Replace with wagmi useAccount / useBalance
  return (
    <div className="flex items-center gap-0 bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-r border-[#2a2a2a]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-xs text-[#888]">{address}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="font-mono text-xs font-semibold text-white">
          {balance.toLocaleString()}
        </span>
        <span className="text-[10px] font-mono text-[#e8002d] font-bold">$LAP</span>
      </div>
    </div>
  );
}

// ============================================================================
// HERO / RACE CARD
// ============================================================================

function RaceHero() {
  const raceDate = new Date('2026-05-25T15:00:00Z');
  const [time, setTime] = useState(getTimeRemaining(raceDate));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeRemaining(raceDate)), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#0e0e0e]">
      {/* Background texture lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)',
        }}
      />
      {/* Red glow top-right */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#e8002d] blur-[100px] opacity-10 pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Top row: round badge + status */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#e8002d] bg-[#e8002d]/10 border border-[#e8002d]/20 px-2 py-0.5 rounded">
              RD. 08
            </span>
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
              Formula 1 World Championship
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400">Picks Open</span>
          </div>
        </div>

        {/* Main layout: race info + countdown */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          {/* Left: Race title */}
          <div>
            <h2
              className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-1"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              Monaco
            </h2>
            <h2 className="text-5xl md:text-6xl font-black text-[#e8002d] tracking-tight leading-none mb-4">
              Grand Prix
            </h2>
            {/* Track stats row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#555]">
              <span className="flex items-center gap-1.5">
                <CircleDot className="w-3 h-3" />
                Circuit de Monaco
              </span>
              <span className="hidden sm:block text-[#333]">·</span>
              <span>78 Laps</span>
              <span className="hidden sm:block text-[#333]">·</span>
              <span>260.3 km</span>
              <span className="hidden sm:block text-[#333]">·</span>
              <span>2 DRS Zones</span>
            </div>
          </div>

          {/* Right: Countdown + CTA */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            {/* Countdown */}
            <div>
              <p className="text-[10px] font-mono text-[#444] uppercase tracking-[0.15em] mb-2 lg:text-right">
                Race starts in
              </p>
              <div className="flex items-end gap-1">
                {[
                  { v: pad(time.days),    l: 'd' },
                  { v: pad(time.hours),   l: 'h' },
                  { v: pad(time.minutes), l: 'm' },
                  { v: pad(time.seconds), l: 's' },
                ].map((unit, i) => (
                  <div key={i} className="flex items-end gap-0.5">
                    {i > 0 && <span className="font-mono text-2xl text-[#2a2a2a] mb-1 mr-0.5">:</span>}
                    <div className="flex flex-col items-center">
                      <div className="bg-[#161616] border border-[#2a2a2a] rounded px-2.5 py-1.5 min-w-[48px] text-center">
                        <span className="font-mono text-2xl font-black text-white tabular-nums">
                          {unit.v}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-[#444] mt-1">{unit.l}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button className="group flex items-center gap-2 bg-[#e8002d] hover:bg-[#ff1a42] text-white px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-[0_0_24px_rgba(232,0,45,0.35)]">
              <Flag className="w-4 h-4" />
              <span className="font-semibold text-sm">Lock In Picks</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-px bg-gradient-to-r from-[#e8002d] via-[#e8002d]/30 to-transparent" />
    </div>
  );
}

// ============================================================================
// BUDGET BAR
// ============================================================================

function BudgetBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100);
  const barColor = pct > 90 ? '#e8002d' : pct > 75 ? '#f97316' : '#22c55e';
  const remaining = total - used;

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-mono text-[#555] uppercase tracking-wider">Budget Cap</span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-bold text-white">${used.toFixed(1)}M</span>
          <span className="font-mono text-xs text-[#444]">/ ${total}M</span>
        </div>
      </div>
      <div className="relative h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
        {/* tick marks */}
        {[25, 50, 75].map(tick => (
          <div
            key={tick}
            className="absolute top-0 h-full w-px bg-[#2a2a2a]"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
      <p className="text-[11px] font-mono text-[#555]">
        ${remaining.toFixed(1)}M remaining · {(100 - pct).toFixed(0)}% headroom
      </p>
    </div>
  );
}

// ============================================================================
// DRIVER CARD
// ============================================================================

function DriverCard({ driver }: { driver: Driver }) {
  const isUp   = driver.form === 'up';
  const isDown = driver.form === 'down';

  return (
    <div className="group relative bg-[#111111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl p-4 transition-all duration-200 cursor-pointer hover:bg-[#141414]">
      {/* Team color strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl opacity-70"
        style={{ background: driver.teamColor }}
      />

      {/* Number + abbr */}
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-3xl font-black opacity-10 leading-none select-none"
          style={{ color: driver.teamColor }}
        >
          {driver.number}
        </span>
        <span className="font-mono text-[10px] text-[#555] border border-[#222] px-1.5 py-0.5 rounded">
          {driver.abbr}
        </span>
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-white leading-tight mb-0.5">
        {driver.name.split(' ')[0]}
      </p>
      <p className="text-xs text-[#555] mb-3">{driver.name.split(' ').slice(1).join(' ')}</p>

      {/* Stats row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-[#444]">pts</p>
          <p className="font-mono text-sm font-bold text-white">{driver.recentPoints}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-[#444]">cost</p>
          <p className="font-mono text-sm font-bold text-[#e8002d]">${driver.cost}M</p>
        </div>
      </div>

      {/* Delta badge */}
      {driver.delta !== 0 && (
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded ${
            isUp ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? '+' : ''}{driver.delta}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CONSTRUCTOR STRIP
// ============================================================================

function ConstructorStrip({ ctor }: { ctor: Constructor }) {
  const FormIcon = ctor.form === 'up' ? TrendingUp : ctor.form === 'down' ? TrendingDown : Minus;
  const formColor = ctor.form === 'up' ? 'text-emerald-400' : ctor.form === 'down' ? 'text-red-400' : 'text-[#555]';

  return (
    <div className="flex items-center justify-between bg-[#111111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl p-4 transition-all duration-200 cursor-pointer hover:bg-[#141414]">
      <div className="flex items-center gap-4">
        {/* Color swatch */}
        <div
          className="w-1 h-10 rounded-full flex-shrink-0"
          style={{ background: ctor.color }}
        />
        <div>
          <p className="text-[10px] font-mono text-[#444] uppercase tracking-wider mb-0.5">Constructor</p>
          <p className="font-bold text-white text-sm">{ctor.name}</p>
          <p className="text-[10px] font-mono text-[#555]">{ctor.abbr}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <FormIcon className={`w-4 h-4 ${formColor}`} />
        <div className="text-right">
          <p className="text-[10px] font-mono text-[#444]">cost</p>
          <p className="font-mono text-base font-black text-[#e8002d]">${ctor.cost}M</p>
        </div>
        <Gauge className="w-4 h-4 text-[#333]" />
      </div>
    </div>
  );
}

// ============================================================================
// POSITION (STAKE) CARD
// ============================================================================

function PositionCard({ pos }: { pos: Position }) {
  const multiplier = (pos.potentialPayout / pos.staked).toFixed(2);
  const statusColor =
    pos.status === 'live'    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
    pos.status === 'settled' ? 'text-[#555] bg-[#1a1a1a] border-[#2a2a2a]' :
                               'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  const statusDot =
    pos.status === 'live'    ? 'bg-emerald-400 animate-pulse' :
    pos.status === 'settled' ? 'bg-[#444]' :
                               'bg-yellow-400';

  return (
    <div className="bg-[#111111] border border-[#1e1e1e] hover:border-[#e8002d]/30 rounded-xl p-4 transition-all duration-200 group">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`flex items-center gap-1.5 text-[10px] font-mono border rounded px-2 py-0.5 ${statusColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              {pos.status.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono text-[#444]">{pos.type}</span>
          </div>
          <p className="text-sm font-semibold text-white leading-snug">{pos.description}</p>
        </div>
        <div className="flex-shrink-0 ml-3 text-right">
          <p className="font-mono text-lg font-black text-emerald-400">{multiplier}×</p>
          <p className="text-[9px] font-mono text-[#444]">payout</p>
        </div>
      </div>

      <p className="text-[10px] font-mono text-[#444] mb-3 flex items-center gap-1.5">
        <CircleDot className="w-3 h-3" />
        {pos.race}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
        <div>
          <p className="text-[10px] font-mono text-[#444]">Staked</p>
          <p className="font-mono text-sm font-bold text-white">{pos.staked} <span className="text-[#e8002d] text-[10px]">$LAP</span></p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#333] group-hover:text-[#555] transition-colors" />
        <div className="text-right">
          <p className="text-[10px] font-mono text-[#444]">If correct</p>
          <p className="font-mono text-sm font-bold text-[#e8002d]">{pos.potentialPayout} <span className="text-[10px]">$LAP</span></p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIMING TOWER (LEADERBOARD)
// ============================================================================

function TimingTower({ entries }: { entries: Standing[] }) {
  const gap = (pts: number, topPts: number) => {
    const diff = topPts - pts;
    return diff === 0 ? 'LEADER' : `–${diff.toLocaleString()} pts`;
  };
  const topPts = entries[0]?.points ?? 0;

  const rankMetal: Record<number, string> = {
    1: '#FFD700',
    2: '#C0C0C0',
    3: '#CD7F32',
  };

  return (
    <div className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#e8002d]" />
          <span className="text-xs font-mono text-[#888] uppercase tracking-wider">Season Standings</span>
        </div>
        <span className="text-[10px] font-mono text-[#444]">Top 3 + You</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#111]">
        {entries.map((entry, i) => (
          <div key={entry.rank}>
            {/* Separator dot when there's a rank gap */}
            {i > 0 && entries[i - 1].rank + 1 !== entry.rank && (
              <div className="flex items-center justify-center py-1.5 bg-[#0a0a0a]">
                <span className="text-[10px] font-mono text-[#333]">· · ·</span>
              </div>
            )}
            <div
              className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                entry.isCurrentUser ? 'bg-[#e8002d]/5 border-l-2 border-[#e8002d]' : 'hover:bg-[#111]'
              }`}
            >
              {/* Rank */}
              <div
                className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: rankMetal[entry.rank] ?? '#1a1a1a',
                  border: rankMetal[entry.rank] ? 'none' : '1px solid #2a2a2a',
                }}
              >
                <span
                  className="font-mono text-xs font-black"
                  style={{ color: rankMetal[entry.rank] ? '#000' : '#666' }}
                >
                  {entry.rank <= 3 ? entry.rank : entry.rank}
                </span>
              </div>

              {/* Address + change */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white truncate">{entry.address}</span>
                  {entry.isCurrentUser && (
                    <span className="text-[9px] font-mono text-[#e8002d] border border-[#e8002d]/30 px-1.5 py-0.5 rounded flex-shrink-0">
                      YOU
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {entry.change > 0 && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                  {entry.change < 0 && <TrendingDown className="w-3 h-3 text-red-400" />}
                  {entry.change === 0 && <Minus className="w-3 h-3 text-[#444]" />}
                  <span className="text-[10px] font-mono text-[#444]">
                    {gap(entry.points, topPts)}
                  </span>
                </div>
              </div>

              {/* Points */}
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {entry.points.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function Dashboard() {
  // TODO: Replace with wagmi useAccount / useBalance
  const walletAddress = '0x1A2...3F4';
  const tokenBalance  = 5420;
  const globalRank    = 402;
  const totalPoints   = 1542;

  // TODO: Replace with smart contract data
  const totalCost = MOCK_DRIVERS.reduce((s, d) => s + d.cost, 0) + MOCK_CONSTRUCTOR.cost;
  const budgetCap = 145;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <LapLogicLogo />

            {/* Nav links — desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {['Dashboard', 'Lineup', 'Leaderboard', 'History'].map((item, i) => (
                <a
                  key={item}
                  href="#"
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    i === 0
                      ? 'text-white bg-[#1a1a1a]'
                      : 'text-[#555] hover:text-[#888]'
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Right: stats + wallet */}
            <div className="flex items-center gap-2">
              {/* Points pill */}
              <div className="hidden sm:flex items-center gap-2 bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#e8002d]" />
                <span className="font-mono text-xs text-[#888]">Rank</span>
                <span className="font-mono text-xs font-bold text-white">#{globalRank}</span>
                <span className="w-px h-3 bg-[#2a2a2a]" />
                <span className="font-mono text-xs font-bold text-white">{totalPoints.toLocaleString()}</span>
                <span className="font-mono text-[10px] text-[#444]">pts</span>
              </div>
              <WalletBadge address={walletAddress} balance={tokenBalance} />
            </div>
          </div>
        </div>
      </header>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* RACE HERO */}
        <RaceHero />

        {/* THE GARAGE */}
        <section>
          {/* Section label */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-[#e8002d] rounded-full" />
            <h2 className="text-lg font-black text-white tracking-tight">The Garage</h2>
            <span className="font-mono text-xs text-[#444]">— your current build</span>
          </div>

          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 space-y-6">
            <BudgetBar used={totalCost} total={budgetCap} />

            {/* Drivers */}
            <div>
              <p className="text-[10px] font-mono text-[#444] uppercase tracking-[0.2em] mb-3">
                Drivers · 5 selected
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {MOCK_DRIVERS.map(d => <DriverCard key={d.id} driver={d} />)}
              </div>
            </div>

            {/* Constructor */}
            <div>
              <p className="text-[10px] font-mono text-[#444] uppercase tracking-[0.2em] mb-3">
                Constructor · 1 selected
              </p>
              <ConstructorStrip ctor={MOCK_CONSTRUCTOR} />
            </div>
          </div>
        </section>

        {/* POSITIONS + STANDINGS */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Open Positions */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-[#e8002d] rounded-full" />
              <h2 className="text-lg font-black text-white tracking-tight">Open Positions</h2>
              <span className="font-mono text-[10px] border border-[#2a2a2a] text-[#555] px-2 py-0.5 rounded">
                {MOCK_POSITIONS.length} active
              </span>
            </div>
            {/* TODO: Fetch from smart contract */}
            <div className="space-y-3">
              {MOCK_POSITIONS.map(p => <PositionCard key={p.id} pos={p} />)}
            </div>
          </div>

          {/* Timing Tower */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-[#e8002d] rounded-full" />
              <h2 className="text-lg font-black text-white tracking-tight">Timing Tower</h2>
            </div>
            {/* TODO: Fetch from API or contract */}
            <TimingTower entries={MOCK_STANDINGS} />

            {/* CTA */}
            <button className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-mono text-[#555] hover:text-[#888] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-xl py-3 transition-all duration-200">
              View full standings
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#111] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <LapLogicLogo size="sm" />
              <span className="text-[#2a2a2a] text-xs hidden sm:block">|</span>
              <span className="font-mono text-[11px] text-[#333]">
                On-chain · 2026 Season
              </span>
            </div>
            <div className="flex items-center gap-5">
              {['Docs', 'Discord', 'X / Twitter', 'Audit'].map(link => (
                <a
                  key={link}
                  href="#"
                  className="font-mono text-[11px] text-[#333] hover:text-[#666] transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
