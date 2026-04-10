import { useAppState } from '../../context/AppContext';

const templates = [
  { id: 'classic', name: 'Classic', icon: '📄' },
  { id: 'modern', name: 'Modern', icon: '🎨' },
  { id: 'technical', name: 'Technical', icon: '⚙️' },
];

export default function TemplateSelector() {
  const { state, dispatch } = useAppState();

  return (
    <div className="template-selector">
      <span className="template-selector-label">Template:</span>
      <div className="template-pills">
        {templates.map((tmpl) => (
          <button
            key={tmpl.id}
            className={`template-pill ${state.selectedTemplate === tmpl.id ? 'selected' : ''}`}
            onClick={() => dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: tmpl.id })}
          >
            <span>{tmpl.icon}</span> {tmpl.name}
          </button>
        ))}
      </div>
    </div>
  );
}
