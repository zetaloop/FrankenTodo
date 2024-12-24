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
  "Bug",
  "Feature",
  "Documentation",
]

export const statuses = [
  {
    value: "backlog",
    label: "未确定",
    icon: HelpCircle,
    weight: 0
  },
  {
    value: "todo",
    label: "未开始",
    icon: Circle,
    weight: 1
  },
  {
    value: "in progress",
    label: "进行中",
    icon: Timer,
    weight: 2
  },
  {
    value: "done",
    label: "已完成",
    icon: CheckCircle,
    weight: 3
  },
  {
    value: "canceled",
    label: "已取消",
    icon: CircleOff,
    weight: 4
  },
]

export const priorities = [
  {
    label: "低",
    value: "low",
    icon: ArrowDown,
    weight: 0
  },
  {
    label: "中",
    value: "medium",
    icon: ArrowRight,
    weight: 1
  },
  {
    label: "高",
    value: "high",
    icon: ArrowUp,
    weight: 2
  },
]
