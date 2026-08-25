import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronLeft, FiChevronRight, FiCalendar,
  FiCheck, FiAlertCircle, FiClock
} from 'react-icons/fi';
import {
  format, addMonths, subMonths, startOfMonth, getDay,
  getDaysInMonth, isSameDay, isToday, isPast, parseISO, isSameMonth
} from 'date-fns';
import type { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRIORITY_DOT_COLORS: Record<string, string> = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#3b82f6',
};

export default function CalendarView({
  tasks, onEditTask, onToggleTask, onDeleteTask, onAddTask
}: CalendarViewProps) {
  const [viewDate, setViewDate]   = useState(new Date());
  const [selected, setSelected]   = useState<Date | null>(new Date());

  const year       = viewDate.getFullYear();
  const month      = viewDate.getMonth();
  const firstDow   = getDay(startOfMonth(viewDate));   // 0=Sun
  const totalDays  = getDaysInMonth(viewDate);

  // Build grid cells: nulls for leading empty days, then 1..totalDays
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  // Group tasks by their due-date string
  const tasksByDate: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (t.dueDate) {
      tasksByDate[t.dueDate] = tasksByDate[t.dueDate] ?? [];
      tasksByDate[t.dueDate].push(t);
    }
  }

  // Tasks for the selected day
  const selectedStr  = selected ? format(selected, 'yyyy-MM-dd') : '';
  const selectedTasks = tasksByDate[selectedStr] ?? [];

  const goToPrev = () => setViewDate(d => subMonths(d, 1));
  const goToNext = () => setViewDate(d => addMonths(d, 1));
  const goToToday = () => { setViewDate(new Date()); setSelected(new Date()); };

  return (
    <div className="cal-page">
      {/* ── Month header ── */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={goToPrev} aria-label="Previous month">
          <FiChevronLeft />
        </button>
        <div className="cal-header-center">
          <h2 className="cal-month-title">
            {format(viewDate, 'MMMM yyyy')}
          </h2>
          {!isSameMonth(viewDate, new Date()) && (
            <button className="today-pill" onClick={goToToday}>Today</button>
          )}
        </div>
        <button className="cal-nav-btn" onClick={goToNext} aria-label="Next month">
          <FiChevronRight />
        </button>
      </div>

      {/* ── Weekday labels ── */}
      <div className="cal-weekdays">
        {WEEKDAYS.map(d => <span key={d} className="cal-wd">{d}</span>)}
      </div>

      {/* ── Day grid ── */}
      <div className="cal-grid">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="cal-cell empty" />;

          const cellDate = new Date(year, month, day);
          const dateStr  = format(cellDate, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dateStr] ?? [];
          const isSelectedDay = selected ? isSameDay(cellDate, selected) : false;
          const isCurrentDay  = isToday(cellDate);
          const hasOverdue    = dayTasks.some(t => !t.completed && isPast(cellDate) && !isCurrentDay);

          return (
            <button
              key={day}
              className={[
                'cal-cell',
                isCurrentDay  ? 'today'    : '',
                isSelectedDay ? 'selected' : '',
                hasOverdue    ? 'overdue'  : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setSelected(cellDate)}
            >
              <span className="cal-day-num">{day}</span>
              {/* Task dots */}
              {dayTasks.length > 0 && (
                <div className="cal-dots">
                  {dayTasks.slice(0, 3).map(t => (
                    <span
                      key={t.id}
                      className={`cal-dot ${t.completed ? 'done' : ''}`}
                      style={{ backgroundColor: t.completed ? 'var(--text-tertiary)' : PRIORITY_DOT_COLORS[t.priority] }}
                    />
                  ))}
                  {dayTasks.length > 3 && <span className="cal-dot-more">+{dayTasks.length - 3}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Selected day panel ── */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selectedStr}
            className="cal-day-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="cal-panel-header">
              <div>
                <div className="cal-panel-date">{format(selected, 'EEEE')}</div>
                <div className="cal-panel-date-sub">{format(selected, 'MMMM d, yyyy')}</div>
              </div>
              <button className="cal-add-btn" onClick={onAddTask} aria-label="Add task on this date">
                + Add
              </button>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="cal-empty">
                <FiCalendar className="cal-empty-icon" />
                <p>No tasks due on this day</p>
              </div>
            ) : (
              <ul className="cal-task-list">
                {selectedTasks.map(task => (
                  <li key={task.id} className={`cal-task-item ${task.completed ? 'done' : ''}`}>
                    <button
                      className={`cal-task-check ${task.completed ? 'checked' : ''}`}
                      onClick={() => onToggleTask(task.id)}
                      aria-label="Toggle task"
                    >
                      {task.completed && <FiCheck />}
                    </button>
                    <div className="cal-task-body">
                      <span className="cal-task-title">{task.title}</span>
                      <div className="cal-task-meta">
                        <span
                          className="cal-task-priority"
                          style={{ color: PRIORITY_DOT_COLORS[task.priority] }}
                        >
                          {!task.completed && isPast(parseISO(task.dueDate!)) && !isToday(parseISO(task.dueDate!))
                            ? <><FiAlertCircle style={{ marginRight: 3 }} />Overdue</>
                            : <><FiClock style={{ marginRight: 3 }} />{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</>
                          }
                        </span>
                        <span className="cal-task-cat">{task.category}</span>
                      </div>
                    </div>
                    <div className="cal-task-actions">
                      <button className="cal-icon-btn" onClick={() => onEditTask(task)} aria-label="Edit">✏️</button>
                      <button className="cal-icon-btn danger" onClick={() => onDeleteTask(task.id)} aria-label="Delete">🗑️</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
