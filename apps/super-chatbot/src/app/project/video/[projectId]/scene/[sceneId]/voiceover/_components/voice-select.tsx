"use client";

import { useMemo } from "react";
import { useVoiceList } from "@/lib/api";
import type { IResponsePaginated_IVoiceRead_ } from "@turbo-super/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioPlayer } from ".";

export function VoiceSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange?: (value: string | null) => void;
}) {
  const { data, isLoading } = useVoiceList({ limit: 100 });

  const options = useMemo(() => {
    const items: {
      value: string | null;
      label: string;
    }[] =
      (data as IResponsePaginated_IVoiceRead_)?.items?.map((item) => ({
        value: item.name,
        label: item.name,
      })) || [];
    items?.unshift({ value: null, label: "Default" });
    return [...items];
  }, [data]);

  const activeVoice = useMemo(
    () =>
      (data as IResponsePaginated_IVoiceRead_)?.items.find(
        (voice) => voice.name === value
      ),
    [data, value]
  );

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm">Voice</label>
      <div className="flex gap-2">
        <Select
          value={value ?? ""}
          onValueChange={(v) => {
            onChange?.(v || null);
          }}
        >
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            {isLoading && !(data as any)?.items ? (
              <div>Loading...</div>
            ) : (
              options.map((v) => (
                <SelectItem
                  key={v.label}
                  value={v.value || "null"}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs">{v.label || "Default"}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <AudioPlayer src={activeVoice?.preview_url} />
      </div>
    </div>
  );
}
