import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* 表格骨架屏 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] h-10">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead className="w-[100px] h-10">
                <Skeleton className="h-4 w-[60px]" />
              </TableHead>
              <TableHead className="h-10">
                <Skeleton className="h-4 w-[200px]" />
              </TableHead>
              <TableHead className="h-10">
                <Skeleton className="h-4 w-[100px]" />
              </TableHead>
              <TableHead className="h-10">
                <Skeleton className="h-4 w-[100px]" />
              </TableHead>
              <TableHead className="h-10">
                <Skeleton className="h-4 w-[100px]" />
              </TableHead>
              <TableHead className="w-[100px] h-10">
                <Skeleton className="h-4 w-[60px]" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="h-[53px]">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell className="h-[53px]">
                  <Skeleton className="h-4 w-[60px]" />
                </TableCell>
                <TableCell className="h-[53px]">
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell className="h-[53px]">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell className="h-[53px]">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell className="h-[53px]">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell className="h-[53px]">
                  <Skeleton className="h-4 w-[60px]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页骨架屏 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
} 