import { TaskStatus } from '../types/Task';

interface TaskFilterProps {
  statusFilter: TaskStatus | 'ALL';
  onStatusFilterChange: (status: TaskStatus | 'ALL') => void;
  sortBy: 'status' | 'dueDate' | 'none';
  onSortChange: (sort: 'status' | 'dueDate' | 'none') => void;
}

const selectClass =
  'px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm transition cursor-pointer';

export default function TaskFilter({
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}: TaskFilterProps) {
  return (
    <div className="flex gap-2">
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as TaskStatus | 'ALL')}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="ALL">All statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as 'status' | 'dueDate' | 'none')}
        className={selectClass}
        aria-label="Sort tasks"
      >
        <option value="none">Default order</option>
        <option value="status">Sort by status</option>
        <option value="dueDate">Sort by due date</option>
      </select>
    </div>
  );
}
