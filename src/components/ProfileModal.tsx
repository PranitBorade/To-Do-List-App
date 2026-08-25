import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiUser, FiX, FiCheck } from 'react-icons/fi';

const AVATAR_SEEDS = ['Felix','Zara','Milo','Cleo','Niko','Luna','Rex','Ivy','Ace','Bea'];
const STORAGE_KEY = 'profile_photo';
const NAME_KEY = 'profile_name';

interface Props { onClose: () => void; }

export default function ProfileModal({ onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(localStorage.getItem(STORAGE_KEY) || '');
  const [name,    setName]    = useState(localStorage.getItem(NAME_KEY) || '');
  const [saved,   setSaved]   = useState(false);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const selectAvatar = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    setPreview(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (preview) localStorage.setItem(STORAGE_KEY, preview);
    else localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(NAME_KEY, name.trim());
    setSaved(true);
    setTimeout(onClose, 600);
  };

  const handleClear = () => { setPreview(''); };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <motion.div
        className="bottom-sheet"
        style={{ maxHeight: '92vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        <div className="profile-modal-header">
          <h2>Your Profile</h2>
          <button className="icon-close-btn" onClick={onClose} aria-label="Close"><FiX /></button>
        </div>

        {/* Current avatar preview */}
        <div className="avatar-preview-wrap">
          <div className="avatar-preview-ring">
            {preview
              ? <img src={preview} alt="avatar" className="avatar-preview-img" />
              : <FiUser className="avatar-placeholder-icon" />}
          </div>
          <div className="avatar-preview-actions">
            <button className="avatar-action-btn" onClick={() => fileRef.current?.click()}>
              <FiUpload /> Upload photo
            </button>
            {preview && (
              <button className="avatar-action-btn danger" onClick={handleClear}>
                <FiX /> Remove
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
        </div>

        {/* Name field */}
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label htmlFor="profile-name">Display Name</label>
          <input
            id="profile-name"
            type="text"
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {/* Avatar grid */}
        <div className="form-group">
          <label>Choose an Avatar</label>
          <div className="avatar-grid">
            {AVATAR_SEEDS.map(seed => {
              const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
              const isSelected = preview === url;
              return (
                <button
                  key={seed}
                  className={`avatar-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectAvatar(seed)}
                  aria-label={`Avatar ${seed}`}
                >
                  <img src={url} alt={seed} />
                  {isSelected && <span className="avatar-check"><FiCheck /></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <button className={`btn btn-primary w-full ${saved ? 'saved' : ''}`} style={{ marginTop: 24 }} onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </motion.div>
    </div>
  );
}
