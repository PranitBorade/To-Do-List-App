import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiCalendar, FiCheck } from 'react-icons/fi';
import { format, isPast, isToday } from 'date-fns';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Work:     'var(--color-work)',
  Personal: 'var(--color-personal)',
  Fitness:  'var(--color-fitness)',
  Study:    'var(--color-study)',
  Other:    'var(--color-other)',
};

const PRIORITY_LABELS: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High' };

export default function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [checking, setChecking] = useState(false);

  const formattedDate = task.dueDate
    ? isToday(new Date(task.dueDate))
      ? 'Today'
      : format(new Date(task.dueDate), 'MMM d')
    : null;

  const isOverdue =
    task.dueDate &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate)) &&
    !task.completed;

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => { onToggle(); setChecking(false); }, 250);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{ duration: 0.22, type: 'spring', bounce: 0.2 }}
      className={`task-card ${task.completed ? 'completed' : ''}`}
    >
      {/* Animated Checkbox */}
      <button
        className={`circle-check ${task.completed ? 'checked' : ''} ${checking ? 'checking' : ''}`}
        onClick={handleCheck}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        <AnimatePresence>
          {task.completed && (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="check-mark"
            >
              <FiCheck />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          <span className="meta-tag category">
            <i className="dot" style={{ backgroundColor: CATEGORY_COLORS[task.category] ?? 'var(--color-other)' }} />
            {task.category}
          </span>
          <span className={`meta-tag priority-${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          {formattedDate && (
            <span className="meta-tag" style={isOverdue ? { color: 'var(--priority-high)', background: 'rgba(239,68,68,0.1)' } : {}}>
              <FiCalendar size={11} />
              {formattedDate}{isOverdue ? ' !' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="action-btn" onClick={onEdit} aria-label="Edit task">
          <FiEdit2 size={14} />
        </button>
        <button className="action-btn delete" onClick={onDelete} aria-label="Delete task">
          <FiTrash2 size={14} />
        </button>
      </div>
    </motion.li>
  );
}
