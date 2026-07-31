import { useMemo, useState } from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronDown } from "lucide-react";

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
            "group flex w-full min-w-0 items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left text-base text-foreground transition-all",
            "hover:border-primary/50 hover:shadow-[var(--shadow-card)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            invalid ? "border-destructive" : "border-border",
            className,
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <CalendarDays className="size-5" />
          </span>

          <span className="flex-1 min-w-0">
            {selected ? (
              <>
                <span className="block truncate font-medium capitalize">
                  {format(selected, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                <span className="block truncate text-sm capitalize text-muted-foreground">
                  {format(selected, "EEEE", { locale: ptBR })}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Escolher data de liberação</span>
            )}
          </span>

          <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-full max-w-[340px] overflow-hidden rounded-2xl border-border bg-card p-0 shadow-[var(--shadow-soft)]"
      >
        <div className="border-b border-border/70 bg-muted/40 px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="text-sm font-medium text-foreground">Data de liberação</p>
          <p className="text-xs text-muted-foreground">O devocional aparece para as assinantes nesse dia.</p>
        </div>

        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected}
          onSelect={commit}
          initialFocus
          className={cn("pointer-events-auto w-full bg-transparent p-2 sm:p-3", "[--cell-size:2.5rem] sm:[--cell-size:2.8rem]")}
          classNames={{
            caption_label: "text-base font-semibold capitalize text-foreground",
            button_previous:
              "size-9 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary",
            button_next:
              "size-9 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary",
            weekday: "flex-1 text-xs font-medium uppercase tracking-wide text-muted-foreground",
            day: "relative aspect-square h-full w-full select-none p-0 text-center",
            today: "rounded-xl ring-1 ring-inset ring-primary/40",
            outside: "text-muted-foreground/40",
            disabled: "opacity-40",
          }}
          components={{
            DayButton: ({ day, modifiers, className, ...props }) => (
              <button
                {...props}
                data-selected={modifiers.selected || undefined}
                className={cn(
                  "flex aspect-square h-auto w-full items-center justify-center rounded-xl text-sm sm:text-base text-foreground/85 transition-colors",
                  "hover:bg-primary/10 hover:text-primary",
                  "data-[selected=true]:bg-[image:var(--gradient-grace)] data-[selected=true]:font-semibold data-[selected=true]:text-primary-foreground data-[selected=true]:shadow-[var(--shadow-card)]",
                  className,
                )}
              >
                {day.date.getDate()}
              </button>
            ),
          }}
        />

        <div className="flex items-center justify-between gap-2 border-t border-border/70 px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="text-sm text-muted-foreground">Toque em um dia</span>
          <button
            type="button"
            onClick={() => commit(new Date())}
            className="rounded-full border border-primary/30 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Hoje
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
