import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFormData, TaskStatus } from './types/Task';
import { taskService } from './services/taskService';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import SearchBar from './components/SearchBar';
import TaskFilter from './components/TaskFilter';
import toast from 'react-hot-toast';

const StatCard = ({ label, count, color }: { label: string; count: number; color: string }) => (
  <div className={`flex flex-col items-center justify-center rounded-2xl px-5 py-3 ${color}`}>
    <span className="text-2xl font-extrabold leading-none">{count}</span>
    <span className="text-xs font-medium mt-0.5 tracking-wide uppercase opacity-80">{label}</span>
  </div>
);

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  const openCreateForm = () => { setEditingTask(null); setShowForm(true); };
  const openEditForm = (task: Task) => { setEditingTask(task); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingTask(null); };

  const handleSubmit = async (formData: TaskFormData) => {
    if (editingTask) {
      const updated = await taskService.updateTask(editingTask.id, formData);
      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      toast.success('Task updated!');
    } else {
      const created = await taskService.createTask(formData);
      setTasks(prev => [...prev, created]);
      toast.success('Task created!');
    }
    closeForm();
  };

  const handleDelete = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const updated = await taskService.updateTask(id, { ...task, status });
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredTasks = [...tasks]
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

  const taskCounts = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          {/* Top row: title + button */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg shadow-inner">
                ✅
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-none">
                  Task Manager
                </h1>
                <p className="text-indigo-200 text-xs mt-0.5">Stay organised, stay on top.</p>
              </div>
            </div>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-1.5 bg-white text-indigo-700 font-semibold text-sm px-4 py-2 rounded-xl shadow hover:bg-indigo-50 active:scale-95 transition-all"
            >
              <span className="text-base leading-none">＋</span>
              <span>New Task</span>
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <StatCard label="Total"       count={taskCounts.total}      color="bg-white/15 text-white" />
            <StatCard label="To Do"       count={taskCounts.todo}        color="bg-slate-200/20 text-slate-100" />
            <StatCard label="In Progress" count={taskCounts.inProgress}  color="bg-amber-400/20 text-amber-100" />
            <StatCard label="Done"        count={taskCounts.done}        color="bg-emerald-400/20 text-emerald-100" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Global error banner */}
        {globalError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm">
            <span className="mt-0.5 text-red-400 text-lg shrink-0">⚠</span>
            <p className="text-sm leading-snug">{globalError}</p>
          </div>
        )}

        {/* Search & Filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <TaskFilter
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Results label */}
        {!loading && (
          <p className="text-xs text-slate-400 font-medium">
            Showing {filteredTasks.length} of {taskCounts.total} task{taskCounts.total !== 1 ? 's' : ''}
          </p>
        )}

        {/* Task list */}
        <TaskList
          tasks={filteredTasks}
          loading={loading}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </main>

      {/* Modal overlay */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <TaskForm task={editingTask} onSubmit={handleSubmit} onCancel={closeForm} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
