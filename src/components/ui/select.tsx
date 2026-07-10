"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

import { useDismissable } from "@/hooks/use-dismissable";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Select({
  id,
  value,
  onChange,
  options,
  placeholder = "Selecione…",
  disabled = false,
  invalid = false,
  className,
  ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useDismissable(containerRef, open, () => setOpen(false));

  const selected = options.find((option) => option.value === value);

  function openList() {
    setOpen(true);
    setHighlighted(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
  }

  function selectOption(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openList();
          return;
        }
        const delta = event.key === "ArrowDown" ? 1 : -1;
        setHighlighted((current) => (current + delta + options.length) % options.length);
        return;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!open) {
          openList();
          return;
        }
        const option = options[highlighted];
        if (option) selectOption(option.value);
        return;
      }
      case "Home":
      case "End": {
        if (open) {
          event.preventDefault();
          setHighlighted(event.key === "Home" ? 0 : options.length - 1);
        }
        return;
      }
      case "Escape": {
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        return;
      }
      case "Tab": {
        setOpen(false);
        return;
      }
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-left text-sm text-zinc-900 transition-colors",
          "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none",
          "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
          invalid && "border-red-400 focus:ring-red-500/20",
        )}
      >
        <span className={cn("truncate", !selected && "text-zinc-400")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-zinc-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-64 w-full origin-top animate-scale-in overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
        >
          {options.map((option, index) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => selectOption(option.value)}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm text-zinc-700 transition-colors",
                  index === highlighted && "bg-zinc-100",
                  option.value === value && "font-medium text-emerald-700",
                )}
              >
                {option.label}
                {option.value === value && (
                  <Check aria-hidden className="size-4 shrink-0 text-emerald-600" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
