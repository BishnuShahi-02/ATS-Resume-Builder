import { useRef, useState } from 'react';
import { useAppState } from '../../context/AppContext';

export default function ResumeUpload() {
  const { state, dispatch } = useAppState();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const { inputMode, resumeFile, resumeText } = state;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch({ type: 'SET_RESUME_FILE', payload: file });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      dispatch({ type: 'SET_RESUME_FILE', payload: file });
    }
  };

  const handleRemoveFile = () => {
    dispatch({ type: 'SET_RESUME_FILE', payload: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <span className="card-icon">📄</span>
        <span className="card-title">Resume</span>
      </div>

      {/* Tab toggle */}
      <div className="input-tabs">
        <button
          className={`input-tab ${inputMode === 'file' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_INPUT_MODE', payload: 'file' })}
        >
          📁 Upload File
        </button>
        <button
          className={`input-tab ${inputMode === 'text' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_INPUT_MODE', payload: 'text' })}
        >
          📝 Paste Text
        </button>
      </div>

      {inputMode === 'file' ? (
        <>
          {!resumeFile ? (
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="upload-icon">⬆</div>
              <div className="upload-text">
                <span className="link">Click to upload</span> or drag and drop
              </div>
              <div className="upload-subtext">PDF, DOCX, or TXT (max 10MB)</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="file-uploaded">
              <span style={{ fontSize: '1.2rem' }}>✅</span>
              <span className="file-name">{resumeFile.name}</span>
              <button className="file-remove" onClick={handleRemoveFile}>✕ Remove</button>
            </div>
          )}
        </>
      ) : (
        <textarea
          className="form-textarea"
          placeholder="Paste your full resume text here..."
          value={resumeText}
          onChange={(e) => dispatch({ type: 'SET_RESUME_TEXT', payload: e.target.value })}
        />
      )}
    </div>
  );
}
