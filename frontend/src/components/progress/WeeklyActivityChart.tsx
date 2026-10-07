import React, { useState } from 'react';
import { WeeklyActivityDay } from '../../types/progress';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface WeeklyActivityChartProps {
  days: WeeklyActivityDay[];
  targetGoalMinutes?: number;
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({
  days,
  targetGoalMinutes = 15,
}) => {
  const [selectedDay, setSelectedDay] = useState<WeeklyActivityDay | null>(
    days.find((d) => d.isToday) || days[days.length - 1] || null
  );

  const totalMinutesThisWeek = days.reduce((sum, d) => sum + d.minutes, 0);
  const totalActivitiesThisWeek = days.reduce((sum, d) => sum + d.activitiesCount, 0);
  const daysGoalMet = days.filter((d) => d.isGoalReached).length;
  const averageMinutesPerDay = Math.round(totalMinutesThisWeek / Math.max(1, days.length));

  // Determine scaling for chart bars (max minutes or at least 45m for breathing room)
  const maxMinutesInDays = Math.max(...days.map((d) => d.minutes), targetGoalMinutes);
  const chartMax = Math.max(30, Math.ceil(maxMinutesInDays / 10) * 10);

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold sm:text-lg">Weekly Activity Chart</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Study duration and daily goals across the past 7 days (real PostgreSQL tracking)
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {daysGoalMet} / 7 Days Goal Met
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
            <Clock className="h-3.5 w-3.5" />
            {totalMinutesThisWeek}m Total (~{averageMinutesPerDay}m/day)
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-semibold text-muted-foreground">
            {totalActivitiesThisWeek} Sessions
          </span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="mt-6">
        <div className="relative pt-6 pb-2">
          {/* Target Goal Dotted Line Indicator */}
          <div
            className="absolute left-0 right-0 z-0 flex items-center border-t border-dashed border-primary/40"
            style={{
              bottom: `${Math.min(95, Math.max(10, (targetGoalMinutes / chartMax) * 100))}%`,
            }}
          >
            <span className="absolute -top-3 right-0 rounded bg-background/80 px-1.5 text-[10px] font-medium text-primary shadow-xs backdrop-blur-xs">
              Daily Goal: {targetGoalMinutes}m
            </span>
          </div>

          {/* Bars Container */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 sm:h-52 items-end">
            {days.map((day) => {
              const heightPct = Math.min(100, Math.max(4, (day.minutes / chartMax) * 100));
              const isSelected = selectedDay?.date === day.date;
              const hasActivity = day.minutes > 0;

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`group relative flex h-full flex-col items-center justify-end rounded-xl p-1 sm:p-2 transition-all focus:outline-hidden ${
                    isSelected
                      ? 'bg-accent/60 ring-2 ring-primary/40'
                      : 'hover:bg-accent/30'
                  }`}
                  aria-label={`${day.fullDay}, ${day.date}: ${day.minutes} minutes`}
                >
                  {/* Tooltip on bar hover */}
                  <div className="absolute -top-7 opacity-0 transition-opacity group-hover:opacity-100 sm:block pointer-events-none z-10">
                    <span className="rounded bg-popover px-2 py-0.5 text-[10px] font-bold text-popover-foreground shadow-md border border-border">
                      {day.minutes}m
                    </span>
                  </div>

                  {/* Vertical Bar */}
                  <div className="relative w-full max-w-[36px] sm:max-w-[42px] flex items-end justify-center rounded-lg bg-muted/40 h-full overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                        day.isGoalReached
                          ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-400 shadow-sm shadow-emerald-500/20'
                          : hasActivity
                          ? 'bg-gradient-to-t from-primary/80 to-primary shadow-sm shadow-primary/20'
                          : 'bg-muted-foreground/15'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`block text-[11px] sm:text-xs font-bold leading-tight ${
                        day.isToday
                          ? 'text-primary font-extrabold underline underline-offset-4 decoration-primary'
                          : 'text-foreground'
                      }`}
                    >
                      {day.day}
                    </span>
                    <span className="text-[10px] text-muted-foreground block leading-none mt-0.5">
                      {day.date.split('-').slice(1).join('/')}
                    </span>
                  </div>

                  {/* Goal Met Star / Dot Indicator */}
                  <div className="mt-1 h-1.5 w-1.5 rounded-full">
                    {day.isGoalReached && (
                      <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Inspector Detail Card */}
      {selectedDay && (
        <div className="mt-4 rounded-xl border border-border/80 bg-background/50 p-3.5 sm:p-4 text-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">
                {selectedDay.fullDay} ({selectedDay.date})
              </span>
              {selectedDay.isToday && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                  Today
                </span>
              )}
              {selectedDay.isGoalReached && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Goal Met 🎉
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div>
                <span className="text-[10px] uppercase tracking-wider block font-medium">
                  Study Time
                </span>
                <span className="font-extrabold text-foreground text-sm">
                  {selectedDay.minutes} mins
                </span>
              </div>
              <div className="border-l border-border/70 pl-4">
                <span className="text-[10px] uppercase tracking-wider block font-medium">
                  Words
                </span>
                <span className="font-extrabold text-foreground text-sm">
                  {selectedDay.wordsCount}
                </span>
              </div>
              <div className="border-l border-border/70 pl-4">
                <span className="text-[10px] uppercase tracking-wider block font-medium">
                  Activities
                </span>
                <span className="font-extrabold text-foreground text-sm">
                  {selectedDay.activitiesCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
