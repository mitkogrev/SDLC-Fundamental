import { useState } from 'react';
import { Task, TaskFormData } from './types/Task';
import { useTaskManager } from './hooks/useTaskManager';
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
  const {
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
  } = useTaskManager();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const openCreateForm = () => { setEditingTask(null); setShowForm(true); };
  const openEditForm = (task: Task) => { setEditingTask(task); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingTask(null); };

  const handleSubmit = async (formData: TaskFormData) => {
    if (editingTask) {
      await handleUpdateTask(editingTask.id, formData);
      toast.success('Task updated!');
    } else {
      await handleCreateTask(formData);
      toast.success('Task created!');
    }
    closeForm();
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
