import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from "lucide-react"

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const statuses = [
  {
    value: "backlog",
    label: "未确定",
    icon: HelpCircle,
  },
  {
    value: "todo",
    label: "未开始",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "进行中",
    icon: Timer,
  },
  {
    value: "done",
    label: "已完成",
    icon: CheckCircle,
  },
  {
    value: "canceled",
    label: "已取消",
    icon: CircleOff,
  },
]

export const priorities = [
  {
    label: "低",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "中",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "高",
    value: "high",
    icon: ArrowUp,
  },
]
