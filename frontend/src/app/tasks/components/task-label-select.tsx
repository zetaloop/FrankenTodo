"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { labels } from "../data/data"

interface TaskLabelSelectProps {
  value: string
  onChange: (value: string) => void
}

export function TaskLabelSelect({
  value,
  onChange,
}: TaskLabelSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedLabels, setSelectedLabels] = React.useState<Set<string>>(
    new Set(value ? [value] : [])
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="选择标签"
          className="w-full justify-between min-h-10 h-auto"
        >
          <div className="flex gap-1 flex-wrap">
            {selectedLabels.size > 0 ? (
              Array.from(selectedLabels).map((label) => {
                const labelData = labels.find((l) => l.value === label)
                return (
                  <Badge 
                    key={label} 
                    variant="secondary"
                    className="mr-1"
                  >
                    {labelData?.label}
                  </Badge>
                )
              })
            ) : (
              <span className="text-muted-foreground">选择标签...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command className="w-full">
          <CommandInput placeholder="搜索标签..." />
          <CommandList>
            <CommandEmpty>
              <div className="flex items-center justify-between px-2 py-1.5">
                <span>未找到标签</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("创建新标签")
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  创建
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {labels.map((label) => (
                <CommandItem
                  key={label.value}
                  onSelect={() => {
                    const newSelectedLabels = new Set(selectedLabels)
                    if (newSelectedLabels.has(label.value)) {
                      newSelectedLabels.delete(label.value)
                    } else {
                      newSelectedLabels.add(label.value)
                    }
                    setSelectedLabels(newSelectedLabels)
                    onChange(Array.from(newSelectedLabels)[0] || "")
                  }}
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedLabels.has(label.value) 
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {label.label}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setSelectedLabels(new Set())
                  onChange("")
                }}
              >
                清除选择
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}