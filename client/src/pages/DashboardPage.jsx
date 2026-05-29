import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../utils/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

const COLUMNS = [
  { key: 'todo', label: 'Todo', icon: '📋', colorVar: '--todo-color' },
  { key: 'in_progress', label: 'In Progress', icon: '🔄', colorVar: '--progress-color' },
  { key: 'done', label: 'Done', icon: '✅', colorVar: '--done-color' },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const tasksByStage = (stage) => tasks.filter((t) => t.stage === stage);

  const handleCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
      toast.success('Task updated');
    } else {
      await createTask(data);
      toast.success('Task created');
    }
    fetchTasks();
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStageChange = async (id, newStage) => {
    try {
      await updateTask(id, { stage: newStage });
      const label = COLUMNS.find(c => c.key === newStage)?.label || newStage;
      toast.success(`Moved to ${label}`);
      fetchTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const total = tasks.length;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header glass">
        <div className="dash-header-left">
          <h1 className="dash-logo"><span className="logo-icon">⚡</span> TaskFlow</h1>
        </div>
        <div className="dash-header-right">
          <span className="user-greeting">Hey, {user?.name?.split(' ')[0] || 'there'}</span>
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-chip">
          <span className="stat-count">{total}</span>
          <span className="stat-label">Total</span>
        </div>
        {COLUMNS.map((col) => (
          <div className="stat-chip" key={col.key}>
            <span className="stat-count" style={{ color: `var(${col.colorVar})` }}>
              {tasksByStage(col.key).length}
            </span>
            <span className="stat-label">{col.label}</span>
          </div>
        ))}
      </div>

      {/* New Task */}
      <div className="dash-toolbar">
        <button className="btn btn-primary btn-new" onClick={handleCreate}>
          + New Task
        </button>
      </div>

      {/* Board */}
      {loading ? (
        <div className="board">
          {COLUMNS.map((col) => (
            <div className="column" key={col.key}>
              <div className="column-header" style={{ borderTopColor: `var(${col.colorVar})` }}>
                <span>{col.icon} {col.label}</span>
              </div>
              <div className="column-cards">
                {[1, 2].map((i) => (
                  <div className="skeleton-card" key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="error-state glass">
          <p>Something went wrong: {error}</p>
          <button className="btn btn-primary" onClick={fetchTasks}>Retry</button>
        </div>
      ) : (
        <div className="board">
          {COLUMNS.map((col) => {
            const colTasks = tasksByStage(col.key);
            return (
              <div className="column" key={col.key}>
                <div className="column-header" style={{ borderTopColor: `var(${col.colorVar})` }}>
                  <span>{col.icon} {col.label}</span>
                  <span className="column-count">{colTasks.length}</span>
                </div>
                <div className="column-cards">
                  {colTasks.length === 0 ? (
                    <p className="empty-col">No tasks here yet</p>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStageChange={handleStageChange}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        task={editingTask}
      />
    </div>
  );
}
