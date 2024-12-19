import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Project } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Circle, ChevronsUpDown } from "lucide-react";
import * as React from "react";

interface DataTableProjectFilterProps {
    projects: Project[]
    value: string
    onChange: (value: string) => void
}

export function DataTableProjectFilter({
    projects,
    value,
    onChange,
}: DataTableProjectFilterProps) {
    const [open, setOpen] = React.useState(false)
    const selectedProject = projects.find((project) => project.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="选择项目"
                    className="h-8 w-[150px] lg:w-[250px] justify-between"
                >
                    <span className={cn(
                        "truncate",
                        !selectedProject && "text-muted-foreground"
                    )}>
                        {selectedProject?.name ?? "选择项目"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[150px] lg:w-[250px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="搜索项目..." />
                    <CommandList>
                        <CommandEmpty>没有找到项目</CommandEmpty>
                        <CommandGroup>
                            {projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    onSelect={() => {
                                        onChange(project.id === value ? "" : project.id)
                                        setOpen(false)
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <Circle
                                        className={cn(
                                            "h-2 w-2",
                                            value === project.id
                                                ? "fill-current"
                                                : "fill-transparent"
                                        )}
                                    />
                                    <span className="truncate">{project.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
} 