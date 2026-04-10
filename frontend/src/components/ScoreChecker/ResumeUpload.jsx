import { useRef, useState } from 'react';
import { useAppState } from '../../context/AppContext';

export default function ResumeUpload() {
  const { state, dispatch } = useAppState();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const validExts = ['.pdf', '.docx', '.txt'];
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      alert('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    dispatch({ type: 'SET_RESUME_FILE', payload: file });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    dispatch({ type: 'SET_RESUME_FILE', payload: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-header-icon blue">📄</div>
        <div>
          <div className="card-title">Resume</div>
          <div className="card-subtitle">Upload your resume or paste the text</div>
        </div>
      </div>

      {/* Toggle */}
      <div className="input-toggle">
        <button
          className={`input-toggle-btn ${state.inputMode === 'file' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_INPUT_MODE', payload: 'file' })}
        >
          📁 Upload File
        </button>
        <button
          className={`input-toggle-btn ${state.inputMode === 'text' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_INPUT_MODE', payload: 'text' })}
        >
          ✏️ Paste Text
        </button>
      </div>

      {state.inputMode === 'file' ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
            id="resume-file-input"
          />
          <div
            className={`upload-zone ${isDragging ? 'dragging' : ''} ${state.resumeFile ? 'has-file' : ''}`}
            style={{ padding: 'var(--space-xl) var(--space-lg)' }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {state.resumeFile ? (
              <div className="upload-file-info">
                <span>✅</span>
                <span className="upload-file-name">{state.resumeFile.name}</span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                  ({(state.resumeFile.size / 1024).toFixed(0)} KB)
                </span>
                <button
                  className="upload-remove"
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="upload-icon" style={{ fontSize: 32, marginBottom: 'var(--space-sm)' }}>📤</div>
                <div className="upload-text">
                  <strong>Click to upload</strong> or drag and drop
                </div>
                <div className="upload-formats">PDF, DOCX, or TXT (max 10MB)</div>
              </>
            )}
          </div>
        </>
      ) : (
        <textarea
          id="resume-text-input"
          className="form-textarea"
          style={{ minHeight: 160 }}
          placeholder="Paste your resume text here..."
          value={state.resumeText}
          onChange={(e) => dispatch({ type: 'SET_RESUME_TEXT', payload: e.target.value })}
          rows={8}
        />
      )}
    </div>
  );
}
