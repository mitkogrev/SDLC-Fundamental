import { memo, useState } from 'react';
import { Task, TaskStatus, STATUS_LABELS, STATUS_COLORS } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

const LEFT_ACCENT: Record<TaskStatus, string> = {
  TODO:        'border-l-slate-400',
  IN_PROGRESS: 'border-l-amber-400',
  DONE:        'border-l-emerald-400',
};

function TaskItem({ task, onEdit, onDelete, onStatusChange }: TaskItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate + 'T23:59:59') < new Date() &&
    task.status !== 'DONE';

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatusUpdating(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div
      className={`
        group relative bg-white rounded-2xl shadow-sm hover:shadow-md
        border border-slate-200/80 border-l-4 ${LEFT_ACCENT[task.status]}
        transition-all duration-200 px-4 py-3.5
        ${task.status === 'DONE' ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Left: content */}
        <div className="flex-1 min-w-0">
          {/* Title + badge */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3
              className={`font-semibold text-slate-800 text-sm leading-snug truncate ${
                task.status === 'DONE' ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${STATUS_COLORS[task.status]}`}
            >
              {STATUS_LABELS[task.status]}
            </span>
            {isOverdue && (
              <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 tracking-wide">
                Overdue
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-1.5">
              {task.description}
            </p>
          )}

          {/* Due date */}
          {task.dueDate && (
            <p className={`text-[11px] font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
              📅{' '}
              {new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {/* Status dropdown */}
          <select
            value={task.status}
            disabled={statusUpdating}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 cursor-pointer"
            aria-label="Change status"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Edit */}
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            aria-label="Edit task"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition font-semibold text-xs ${
              confirmDelete
                ? 'bg-red-500 text-white hover:bg-red-600 px-3'
                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
            }`}
            aria-label={confirmDelete ? 'Confirm delete' : 'Delete task'}
            title={confirmDelete ? 'Click again to confirm' : 'Delete task'}
          >
            {confirmDelete ? (
              'Confirm?'
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(TaskItem);
