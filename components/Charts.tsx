"use client";

import { format } from "date-fns";

export type ConsentSummaryPoint = {
  date: string;
  total: number;
  necessary: number;
  ads: number;
};

function getPercentage(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function ConsentSummaryCards({ points }: { points: ConsentSummaryPoint[] }) {
  const latest = points.at(0);
  const lastWeek = points.slice(0, 7).reduce(
    (acc, point) => {
      acc.total += point.total;
      acc.necessary += point.necessary;
      acc.ads += point.ads;
      return acc;
    },
    { total: 0, necessary: 0, ads: 0 },
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryTile
        title="7d Consent Rate"
        value={`${getPercentage(lastWeek.necessary, lastWeek.total)}%`}
        subtext={`${lastWeek.total} decisions`}
      />
      <SummaryTile
        title="7d Ads Opt-in"
        value={`${getPercentage(lastWeek.ads, lastWeek.total)}%`}
        subtext="includes ads category only"
      />
      <SummaryTile
        title="Latest snapshot"
        value={
          latest ? `${getPercentage(latest.necessary, latest.total)}%` : "N/A"
        }
        subtext={latest ? formatDate(latest.date) : "No data"}
      />
    </div>
  );
}

function SummaryTile({
  title,
  value,
  subtext,
}: {
  title: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="text-xs text-zinc-500">{subtext}</p>
    </div>
  );
}

export function ConsentTrendChart({ points }: { points: ConsentSummaryPoint[] }) {
  const maxTotal = Math.max(...points.map((d) => d.total), 1);
  const width = 600;
  const height = 220;
  const padding = 24;
  const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  const necessaryPath = points
    .map((point, index) => {
      const x = padding + index * step;
      const y =
        height - padding - (point.necessary / maxTotal) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const adsPath = points
    .map((point, index) => {
      const x = padding + index * step;
      const y =
        height - padding - (point.ads / maxTotal) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-900 dark:text-white">
        60-day consent trend
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 w-full"
        role="img"
        aria-label="Consent trend line chart"
      >
        <path
          d={necessaryPath}
          fill="none"
          stroke="#111827"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          d={adsPath}
          fill="none"
          stroke="#fb7185"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        {points.map((point, index) => {
          const x = padding + index * step;
          const y =
            height - padding - (point.necessary / maxTotal) * (height - padding * 2);
          return (
            <circle
              key={point.date}
              cx={x}
              cy={y}
              r={3}
              fill="#111827"
              aria-label={`${formatDate(point.date)} necessary ${point.necessary}`}
            />
          );
        })}
      </svg>
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
        <Legend color="#111827" label="Necessary accepted" />
        <Legend color="#fb7185" label="Advertising accepted" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function formatDate(value: string) {
  try {
    return format(new Date(value), "MMM d");
  } catch {
    return value;
  }
}
