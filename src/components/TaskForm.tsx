import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task, Priority, Category } from '../types';


interface TaskFormProps {
  onClose: () => void;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  initialData?: Task;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Fitness', 'Study', 'Other'];

export default function TaskForm({ onClose, onSave, initialData }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium');
  const [category, setCategory] = useState<Category>(initialData?.category || 'Personal');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), priority, category, dueDate });
  };

  return (
    <AnimatePresence>
      <div className="bottom-sheet-overlay" onClick={onClose}>
        <motion.div 
          className="bottom-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="sheet-handle" />
          
          <div className="form-header">
            <h2>{initialData ? 'Edit Task' : 'New Task'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label htmlFor="title">Task Title</label>
              <input
                autoFocus
                id="title"
                type="text"
                className="form-control"
                style={{ fontSize: '18px', fontWeight: 600 }}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                className="form-control"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add any extra details..."
              />
            </div>

            <div className="selectors-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-control"
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  className="form-control"
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date (Optional)</label>
              <input
                id="dueDate"
                type="date"
                className="form-control"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
                {initialData ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
