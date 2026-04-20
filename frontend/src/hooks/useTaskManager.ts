import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskFormData, TaskStatus } from '../types/Task';
import { taskService } from '../services/taskService';
import toast from 'react-hot-toast';

export interface TaskManagerState {
  loading: boolean;
  globalError: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: TaskStatus | 'ALL';
  setStatusFilter: (f: TaskStatus | 'ALL') => void;
  sortBy: 'status' | 'dueDate' | 'none';
  setSortBy: (s: 'status' | 'dueDate' | 'none') => void;
  filteredTasks: Task[];
  taskCounts: { total: number; todo: number; inProgress: number; done: number };
  handleCreateTask: (formData: TaskFormData) => Promise<Task>;
  handleUpdateTask: (id: number, formData: TaskFormData) => Promise<Task>;
  handleDelete: (id: number) => Promise<void>;
  handleStatusChange: (id: number, status: TaskStatus) => Promise<void>;
}

export function useTaskManager(): TaskManagerState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'status' | 'dueDate' | 'none'>('none');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setGlobalError(null);
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch {
      setGlobalError('Failed to load tasks. Make sure the backend server is running on port 8080.');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = useCallback(async (formData: TaskFormData): Promise<Task> => {
    const created = await taskService.createTask(formData);
    setTasks(prev => [...prev, created]);
    return created;
  }, []);

  const handleUpdateTask = useCallback(async (id: number, formData: TaskFormData): Promise<Task> => {
    const updated = await taskService.updateTask(id, formData);
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    return updated;
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  }, []);

  const handleStatusChange = useCallback(async (id: number, status: TaskStatus) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;
      taskService
        .updateTask(id, { ...task, status })
        .then(updated => {
          setTasks(current => current.map(t => (t.id === id ? updated : t)));
          toast.success('Status updated');
        })
        .catch(() => {
          toast.error('Failed to update status');
        });
      return prev;
    });
  }, []);

  const filteredTasks = useMemo(() => {
    return [...tasks]
      .filter(task => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(q) ||
          (task.description?.toLowerCase().includes(q) ?? false);
        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'status') {
          const order: Record<string, number> = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };
          return order[a.status] - order[b.status];
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, sortBy]);

  const taskCounts = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      done: tasks.filter(t => t.status === 'DONE').length,
    }),
    [tasks]
  );

  return {
    loading,
    globalError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredTasks,
    taskCounts,
    handleCreateTask,
    handleUpdateTask,
    handleDelete,
    handleStatusChange,
  };
}
