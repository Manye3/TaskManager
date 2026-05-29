const STAGES = ['todo', 'in_progress', 'done'];
const STAGE_LABELS = { todo: 'Todo', in_progress: 'In Progress', done: 'Done' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function TaskCard({ task, onEdit, onDelete, onStageChange }) {
  const stageIdx = STAGES.indexOf(task.stage);
  const canMoveLeft = stageIdx > 0;
  const canMoveRight = stageIdx < STAGES.length - 1;

  const priorityClass = `priority-${task.priority || 'medium'}`;

  const truncate = (str, len = 100) => {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '…' : str;
  };

  return (
    <div className={`task-card glass ${priorityClass}-border`}>
      <div className="task-card-header">
        <span className={`priority-badge ${priorityClass}`}>
          {task.priority || 'medium'}
        </span>
        <span className="task-time">{timeAgo(task.created_at || task.updated_at)}</span>
      </div>

      <h3 className="task-title">{task.title}</h3>
      {task.description && (
        <p className="task-desc">{truncate(task.description)}</p>
      )}

      <div className="task-card-actions">
        <div className="stage-nav">
          {canMoveLeft && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onStageChange(task.id, STAGES[stageIdx - 1])}
              title={`Move to ${STAGE_LABELS[STAGES[stageIdx - 1]]}`}
            >
              ← {STAGE_LABELS[STAGES[stageIdx - 1]]}
            </button>
          )}
          {canMoveRight && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onStageChange(task.id, STAGES[stageIdx + 1])}
              title={`Move to ${STAGE_LABELS[STAGES[stageIdx + 1]]}`}
            >
              {STAGE_LABELS[STAGES[stageIdx + 1]]} →
            </button>
          )}
        </div>

        <div className="card-btns">
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)} title="Edit">
            ✏️
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => onDelete(task.id)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
