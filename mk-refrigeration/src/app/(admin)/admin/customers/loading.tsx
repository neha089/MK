import { TableSkeleton } from '@/components/admin/TableSkeleton'

export default function Loading() {
  return <TableSkeleton rows={10} cols={7} />
}
