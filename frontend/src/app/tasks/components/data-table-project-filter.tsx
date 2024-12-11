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
import { cn } from "@/lib/utils";
import { Circle, ChevronsUpDown } from "lucide-react";
import * as React from "react";

const projects = [
    {
        value: "fd9b02ca-5ac9-40c6-b756-ead6786675ae",
        label: "FrankTodo 任务管理系统第二版本云服务",
    },
    {
        value: "62da762d-715b-4c15-a8e7-4c53fd83bea3",
        label: "天气控制器",
    },
] as const;

interface DataTableProjectFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export function DataTableProjectFilter({
    value,
    onChange,
}: DataTableProjectFilterProps) {
    const [open, setOpen] = React.useState(false);
    const selectedProject = projects.find((project) => project.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="选择项目"
                    className="h-8 w-[200px] justify-between"
                >
                    <span className={cn(
                        "truncate",
                        !selectedProject && "text-muted-foreground"
                    )}>
                        {selectedProject?.label ?? "选择项目"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="项目" />
                    <CommandList>
                        <CommandEmpty>没有结果</CommandEmpty>
                        <CommandGroup>
                            {projects.map((project) => (
                                <CommandItem
                                    key={project.value}
                                    onSelect={() => {
                                        onChange(project.value === value ? "" : project.value);
                                        setOpen(false);
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <Circle
                                        className={cn(
                                            "h-2 w-2",
                                            value === project.value
                                                ? "fill-current"
                                                : "fill-transparent"
                                        )}
                                    />
                                    <span className="truncate">{project.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
} 