import { useMemo, useState } from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Terminal } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type VibeDatePickerProps = {
  /** valor no formato yyyy-MM-dd */
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  className?: string;
};

function toDate(value: string) {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function VibeDatePicker({ value, onChange, invalid, className }: VibeDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => toDate(value), [value]);

  const commit = (date?: Date) => {
    if (!date) return;
    onChange(format(date, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl border bg-code px-3 py-2.5 text-left font-mono text-sm text-code-foreground transition-all",
            "hover:border-code-accent/70 hover:shadow-[0_0_0_3px_color-mix(in_oklab,var(--code-accent)_18%,transparent)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-code-accent/60",
            invalid ? "border-destructive" : "border-code-border",
            className,
          )}
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-code-accent/15 text-code-accent">
            <CalendarDays className="size-3.5" />
          </span>
          <span className="flex-1 truncate">
            <span className="text-code-muted">date</span>
            <span className="text-code-muted"> = </span>
            {selected ? (
              <span className="text-cream">"{format(selected, "yyyy-MM-dd")}"</span>
            ) : (
              <span className="text-code-muted italic">null</span>
            )}
          </span>
          <span className="hidden shrink-0 text-[10px] uppercase tracking-[0.18em] text-code-muted sm:inline">
            {selected ? format(selected, "EEE", { locale: ptBR }) : "—"}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto overflow-hidden rounded-2xl border-code-border bg-code p-0 text-code-foreground shadow-2xl"
      >
        {/* barra de janela estilo editor */}
        <div className="flex items-center gap-2 border-b border-code-border/80 px-3 py-2">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-cream/80" />
            <span className="size-2.5 rounded-full bg-code-accent/80" />
          </span>
          <span className="ml-1 flex items-center gap-1.5 font-mono text-[11px] text-code-muted">
            <Terminal className="size-3" />
            publish_date.ts
          </span>
        </div>

        <div className="flex">
          {/* numeração de linhas */}
          <div className="hidden w-8 shrink-0 select-none flex-col items-center gap-[6px] border-r border-code-border/60 py-4 font-mono text-[10px] leading-4 text-code-muted/60 sm:flex">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i}>{String(i + 1).padStart(2, "0")}</span>
            ))}
          </div>

          <Calendar
            mode="single"
            locale={ptBR}
            selected={selected}
            defaultMonth={selected}
            onSelect={commit}
            initialFocus
            className={cn(
              "pointer-events-auto bg-transparent p-3 font-mono",
              "[--cell-size:2.25rem]",
            )}
            classNames={{
              caption_label: "text-sm font-semibold lowercase tracking-tight text-code-foreground",
              button_previous:
                "size-8 rounded-md border border-code-border/70 text-code-muted hover:bg-code-accent/15 hover:text-code-accent",
              button_next:
                "size-8 rounded-md border border-code-border/70 text-code-muted hover:bg-code-accent/15 hover:text-code-accent",
              weekday: "flex-1 text-[10px] uppercase tracking-[0.14em] text-code-muted",
              day: "group/day relative aspect-square h-full w-full select-none p-0 text-center",
              today: "rounded-md ring-1 ring-inset ring-code-accent/50",
              outside: "text-code-muted/40",
              disabled: "opacity-40",
            }}
            components={{
              DayButton: ({ day, modifiers, className, ...props }) => (
                <button
                  {...props}
                  data-selected={modifiers.selected || undefined}
                  className={cn(
                    "flex aspect-square h-auto w-full items-center justify-center rounded-md font-mono text-[13px] text-code-foreground/85 transition-colors",
                    "hover:bg-code-accent/20 hover:text-code-accent",
                    "data-[selected=true]:bg-code-accent data-[selected=true]:font-bold data-[selected=true]:text-code data-[selected=true]:shadow-[0_0_18px_color-mix(in_oklab,var(--code-accent)_45%,transparent)]",
                    className,
                  )}
                >
                  {day.date.getDate()}
                </button>
              ),
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-code-border/80 px-3 py-2 font-mono text-[11px]">
          <span className="text-code-muted">
            <span className="text-code-accent">$</span> selecione um dia
          </span>
          <button
            type="button"
            onClick={() => commit(new Date())}
            className="rounded-md border border-code-border/70 px-2 py-1 text-code-foreground/80 transition-colors hover:border-code-accent hover:text-code-accent"
          >
            hoje()
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
