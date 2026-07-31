import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIBLE_VERSIONS, DEFAULT_BIBLE_VERSION, type BibleVersionId } from "@/lib/bible";

export function BibleVersionSelect({
  value,
  onChange,
}: {
  value?: BibleVersionId | string;
  onChange: (value: BibleVersionId) => void;
}) {
  return (
    <Select value={value || DEFAULT_BIBLE_VERSION} onValueChange={(v) => onChange(v as BibleVersionId)}>
      <SelectTrigger className="rounded-xl">
        <SelectValue placeholder="Escolha a versão" />
      </SelectTrigger>
      <SelectContent>
        {BIBLE_VERSIONS.map((v) => (
          <SelectItem key={v.id} value={v.id}>
            {v.label} — {v.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
