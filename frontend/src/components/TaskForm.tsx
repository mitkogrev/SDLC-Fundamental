import { useState, useEffect } from 'react';
import { Task, TaskFormData, TaskStatus } from '../types/Task';
import { AxiosError } from 'axios';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

const defaultForm: TaskFormData = {
  title: '',
  description: '',
  status: 'TODO',
  dueDate: '',
};

type FieldErrors = Partial<Record<keyof TaskFormData, string>>;

const inputBase =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition';
const inputNormal = `${inputBase} border-slate-200`;
const inputErr    = `${inputBase} border-red-400 bg-red-50 focus:ring-red-400`;

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>(defaultForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        dueDate: task.dueDate ?? '',
      });
    } else {
      setFormData(defaultForm);
    }
    setFieldErrors({});
    setServerError(null);
  }, [task]);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Title must not exceed 100 characters';
    }
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);

    const payload: TaskFormData = {
      title: formData.title.trim(),
      status: formData.status,
      description: formData.description?.trim() || undefined,
      dueDate: formData.dueDate || undefined,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const axiosErr = err as AxiosError<{
        message?: string;
        fieldErrors?: Record<string, string>;
      }>;
      const data = axiosErr?.response?.data;
      if (data?.fieldErrors) {
        const backendErrors: FieldErrors = {};
        for (const [field, msg] of Object.entries(data.fieldErrors)) {
          backendErrors[field as keyof TaskFormData] = msg;
        }
        setFieldErrors(backendErrors);
      } else {
        setServerError(data?.message ?? 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const titleLength = formData.title.length;
  const descLength = (formData.description ?? '').length;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Modal header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
            {task ? '✏' : '＋'}
          </div>
          <h2 className="text-base font-bold text-slate-800">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          aria-label="Close form"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form body */}
      <div className="px-6 py-5 space-y-4">
        {/* Server-level error */}
        {serverError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm" role="alert">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {serverError}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="task-title" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Title <span className="text-red-400 normal-case">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="What needs to be done?"
            maxLength={100}
            className={fieldErrors.title ? inputErr : inputNormal}
            aria-describedby={fieldErrors.title ? 'title-error' : undefined}
            aria-invalid={!!fieldErrors.title}
          />
          <div className="flex justify-between mt-1.5">
            {fieldErrors.title ? (
              <p id="title-error" className="text-xs text-red-500 font-medium" role="alert">{fieldErrors.title}</p>
            ) : <span />}
            <span className={`text-xs font-medium ${titleLength > 90 ? 'text-amber-500' : 'text-slate-400'}`}>
              {titleLength}/100
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-description" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Description <span className="text-slate-400 normal-case font-normal">(optional)</span>
          </label>
          <textarea
            id="task-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Add more details…"
            rows={3}
            maxLength={500}
            className={`resize-none ${fieldErrors.description ? inputErr : inputNormal}`}
            aria-describedby={fieldErrors.description ? 'desc-error' : undefined}
          />
          <div className="flex justify-between mt-1.5">
            {fieldErrors.description ? (
              <p id="desc-error" className="text-xs text-red-500 font-medium" role="alert">{fieldErrors.description}</p>
            ) : <span />}
            <span className={`text-xs font-medium ${descLength > 450 ? 'text-amber-500' : 'text-slate-400'}`}>
              {descLength}/500
            </span>
          </div>
        </div>

        {/* Status + Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-status" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Status
            </label>
            <select
              id="task-status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
              className={inputNormal}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-due-date" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={inputNormal}
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-3xl">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Saving…
            </span>
          ) : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
