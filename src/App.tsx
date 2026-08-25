import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiPlus, FiBriefcase, FiUser, FiActivity, FiBook,
  FiMoreHorizontal, FiCalendar, FiHome, FiSettings,
  FiCheckSquare, FiInfo
} from 'react-icons/fi';
import { format } from 'date-fns';
import { useTasks } from './hooks/useTasks';
import type { Task, Category } from './types';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import ProfileModal from './components/ProfileModal';
import CalendarView from './components/CalendarView';

type FilterType = 'All' | 'Today' | 'Upcoming';
type NavTab = 'home' | 'tasks' | 'calendar' | 'settings';

/* ─── Circular Progress Ring ─── */
function ProgressRing({ radius, stroke, progress }: { radius: number; stroke: number; progress: number }) {
  const nr = radius - stroke * 2;
  const circ = nr * 2 * Math.PI;
  const offset = circ - (Math.min(progress, 100) / 100) * circ;
  return (
    <div style={{ position: 'relative', width: radius * 2, height: radius * 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg height={radius * 2} width={radius * 2} style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle stroke="var(--bg-surface-elevated)" fill="transparent" strokeWidth={stroke} r={nr} cx={radius} cy={radius} />
        <circle
          stroke="var(--accent-primary)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circ} ${circ}`}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          strokeLinecap="round"
          r={nr} cx={radius} cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <span style={{ fontSize: '12px', fontWeight: '700', zIndex: 1 }}>{Math.round(Math.min(progress, 100))}%</span>
    </div>
  );
}

/* ─── Dynamic greeting ─── */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 🌤️';
  if (hour < 17) return 'Good afternoon ☀️';
  if (hour < 21) return 'Good evening 🌆';
  return 'Good night 🌙';
}



/* ─── Settings placeholder ─── */
function SettingsView({ onOpenProfile }: { onOpenProfile: () => void }) {
  return (
    <div className="settings-view">
      <h2 className="section-heading">Settings</h2>
      <div className="settings-list">
        <button className="settings-row" onClick={onOpenProfile}>
          <FiUser className="sr-icon" />
          <span>Edit Profile & Avatar</span>
        </button>
        <div className="settings-row info-row">
          <FiInfo className="sr-icon" />
          <span>My Tasks v2.0</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ APP ═══════════════════════════════════ */
export default function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();

  const [filter,         setFilter]         = useState<FilterType>('All');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [isFormOpen,     setIsFormOpen]     = useState(false);
  const [editingTask,    setEditingTask]    = useState<Task | null>(null);
  const [activeNav,      setActiveNav]      = useState<NavTab>('home');
  const [profileOpen,    setProfileOpen]    = useState(false);

  const todayDate = format(new Date(), 'EEEE, MMMM do');
  const todayStr  = format(new Date(), 'yyyy-MM-dd');

  const tasksCreatedToday   = tasks.filter(t => format(new Date(t.createdAt), 'yyyy-MM-dd') === todayStr).length;
  const tasksCompletedToday = tasks.filter(t => t.completed && format(new Date(t.createdAt), 'yyyy-MM-dd') === todayStr).length;
  const completionPct = tasksCreatedToday === 0 ? 0 : (tasksCompletedToday / tasksCreatedToday) * 100;

  const getCategoryIcon = (cat: Category | 'All') => {
    switch (cat) {
      case 'Work':     return <FiBriefcase />;
      case 'Personal': return <FiUser />;
      case 'Fitness':  return <FiActivity />;
      case 'Study':    return <FiBook />;
      case 'Other':    return <FiMoreHorizontal />;
      default:         return <FiCheckSquare />;
    }
  };

  const categories: (Category | 'All')[] = ['All', 'Work', 'Personal', 'Fitness', 'Study', 'Other'];

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (activeCategory !== 'All') result = result.filter(t => t.category === activeCategory);
    if (filter === 'Today')    result = result.filter(t => t.dueDate === todayStr);
    if (filter === 'Upcoming') result = result.filter(t => t.dueDate && t.dueDate > todayStr);

    const w = { high: 3, medium: 2, low: 1 };
    return result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pd = w[b.priority] - w[a.priority];
      if (pd !== 0) return pd;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, activeCategory, todayStr]);

  const closeForm = () => { setIsFormOpen(false); setEditingTask(null); };
  const handleEdit = (task: Task) => { setEditingTask(task); setIsFormOpen(true); };

  /* ── Home content ── */
  const HomeContent = (
    <>
      {/* Progress Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="progress-section">
        <div className="progress-info">
          <h2>Your Day</h2>
          <p>{tasksCompletedToday} of {tasksCreatedToday} tasks completed</p>
          <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-tertiary)' }}>
            {tasksCreatedToday === 0 ? 'No tasks created today' : completionPct === 100 ? '🎉 All done!' : `${tasksCreatedToday - tasksCompletedToday} remaining`}
          </p>
        </div>
        <ProgressRing radius={40} stroke={6} progress={completionPct} />
      </motion.div>

      {/* Categories */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="categories-wrapper">
        <div className="categories-scroll">
          {categories.map((cat, i) => {
            const count = cat === 'All' ? tasks.length : tasks.filter(t => t.category === cat).length;
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className="category-icon">{getCategoryIcon(cat)}</span>
                <span className="category-name">{cat}</span>
                <span className="category-count">{count}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="filters">
        {(['All', 'Today', 'Upcoming'] as FilterType[]).map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f}
            {filter === f && <motion.div layoutId="filterIndicator" className="filter-indicator" />}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-list-container">
        {filteredTasks.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="empty-state">
            <div className="empty-icon-wrap"><FiCheckSquare /></div>
            <h3>{tasks.length === 0 ? 'You have a clean slate' : 'No tasks here'}</h3>
            <p>{tasks.length === 0 ? "Tap + to add your first task." : "Try a different filter."}</p>
          </motion.div>
        ) : (
          <ul className="task-list">
            <AnimatePresence>
              {filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  onEdit={() => handleEdit(task)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-content">
          <motion.h1 initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="greeting">
            {getGreeting()}
          </motion.h1>
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} className="date-text">
            {todayDate}
          </motion.div>
        </div>
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="profile-btn"
          onClick={() => setProfileOpen(true)}
          aria-label="Open profile"
        >
          <ProfileAvatar />
        </motion.button>
      </header>

      {/* ── Page Content ── */}
      <AnimatePresence mode="wait">
        {activeNav === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {HomeContent}
          </motion.div>
        )}
        {activeNav === 'tasks' && (
          <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {HomeContent}
          </motion.div>
        )}
        {activeNav === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <CalendarView
              tasks={tasks}
              onEditTask={handleEdit}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onAddTask={() => setIsFormOpen(true)}
            />
          </motion.div>
        )}
        {activeNav === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <SettingsView onOpenProfile={() => setProfileOpen(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Navigation ── */}
      <nav className="bottom-nav">
        {([ 
          { id: 'home',     label: 'Home',     Icon: FiHome },
          { id: 'tasks',    label: 'Tasks',    Icon: FiCheckSquare },
          { id: 'spacer',   label: '',         Icon: null },
          { id: 'calendar', label: 'Calendar', Icon: FiCalendar },
          { id: 'settings', label: 'Settings', Icon: FiSettings },
        ] as const).map(item => {
          if (item.id === 'spacer') return <div key="spacer" className="nav-spacer" />;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id as NavTab)}
              aria-label={item.label}
            >
              <span className="nav-icon"><item.Icon /></span>
              <span className="nav-label">{item.label}</span>
              {isActive && <motion.div layoutId="navIndicator" className="nav-dot" />}
            </button>
          );
        })}

        {/* FAB */}
        <div className="fab-wrapper">
          <motion.button
            className="fab"
            onClick={() => { setActiveNav('home'); setIsFormOpen(true); }}
            aria-label="Add Task"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <FiPlus />
          </motion.button>
        </div>
      </nav>

      {/* ── Task Form ── */}
      <AnimatePresence>
        {isFormOpen && (
          <TaskForm
            onClose={closeForm}
            onSave={data => {
              if (editingTask) updateTask(editingTask.id, data);
              else addTask(data);
              closeForm();
            }}
            initialData={editingTask ?? undefined}
          />
        )}
      </AnimatePresence>

      {/* ── Profile Modal ── */}
      <AnimatePresence>
        {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Profile Avatar reads from localStorage ─── */
function ProfileAvatar() {
  const saved = localStorage.getItem('profile_photo');
  return saved
    ? <img src={saved} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
    : <FiUser style={{ fontSize: 22, color: 'var(--text-secondary)' }} />;
}
