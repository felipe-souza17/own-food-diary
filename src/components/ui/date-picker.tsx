"use client";

import { useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { useDismissable } from "@/hooks/use-dismissable";
import { cn, dateStringToUTCDate, formatDateShort, todayInputValue } from "@/lib/utils";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

interface CalendarCell {
  key: string;
  day: number;
  inMonth: boolean;
}

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}

function toDateKey(year: number, monthIndex: number, day: number): string {
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${month}-${String(day).padStart(2, "0")}`;
}

function buildCalendar(year: number, monthIndex: number): CalendarCell[] {
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const daysInPrevMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const cells: CalendarCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(Date.UTC(year, monthIndex - 1, day));
    cells.push({
      key: toDateKey(date.getUTCFullYear(), date.getUTCMonth(), day),
      day,
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ key: toDateKey(year, monthIndex, day), day, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - firstWeekday - daysInMonth + 1;
    const date = new Date(Date.UTC(year, monthIndex + 1, day));
    cells.push({
      key: toDateKey(date.getUTCFullYear(), date.getUTCMonth(), day),
      day,
      inMonth: false,
    });
  }

  return cells;
}

export function DatePicker({
  id,
  value,
  onChange,
  disabled = false,
  invalid = false,
  placeholder = "Selecionar data",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const todayKey = todayInputValue();

  const [view, setView] = useState(() => {
    const base = value || todayKey;
    return { year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 };
  });

  useDismissable(containerRef, open, () => setOpen(false));

  const cells = useMemo(() => buildCalendar(view.year, view.month), [view]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(view.year, view.month, 1))),
    [view],
  );

  function shiftMonth(delta: number) {
    setView((current) => {
      const date = new Date(Date.UTC(current.year, current.month + delta, 1));
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
    });
  }

  function openCalendar() {
    if (value) {
      setView({ year: Number(value.slice(0, 4)), month: Number(value.slice(5, 7)) - 1 });
    }
    setOpen(true);
  }

  function selectDay(cell: CalendarCell) {
    onChange(cell.key);
    setOpen(false);
  }

  function selectToday() {
    onChange(todayKey);
    setView({ year: Number(todayKey.slice(0, 4)), month: Number(todayKey.slice(5, 7)) - 1 });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-3 text-left text-sm text-zinc-900 transition-colors",
          "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none",
          "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
          invalid && "border-red-400 focus:ring-red-500/20",
        )}
      >
        <CalendarDays aria-hidden className="size-4 shrink-0 text-zinc-400" />
        <span className={cn("truncate", !value && "text-zinc-400")}>
          {value ? formatDateShort(dateStringToUTCDate(value)) : placeholder}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Escolher data"
          className="absolute z-30 mt-1.5 w-72 origin-top animate-scale-in rounded-xl border border-zinc-200 bg-white p-3 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Mês anterior"
              className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold text-zinc-900 first-letter:uppercase">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Próximo mês"
              className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7">
            {WEEKDAYS.map((weekday) => (
              <span
                key={weekday}
                className="flex h-8 items-center justify-center text-[11px] font-medium text-zinc-400"
              >
                {weekday}
              </span>
            ))}
            {cells.map((cell) => {
              const isSelected = cell.key === value;
              const isToday = cell.key === todayKey;

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => selectDay(cell)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg text-sm transition-colors",
                    cell.inMonth ? "text-zinc-700" : "text-zinc-300",
                    isSelected
                      ? "bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                      : "hover:bg-zinc-100",
                    isToday && !isSelected && "font-semibold text-emerald-600",
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-zinc-100 pt-2">
            <button
              type="button"
              onClick={selectToday}
              className="w-full rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
