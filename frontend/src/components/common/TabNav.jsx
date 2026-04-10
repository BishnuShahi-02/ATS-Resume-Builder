import { useAppState } from '../../context/AppContext';

const tabs = [
  { id: 'checker', label: 'Score Checker & Optimizer', icon: '📊' },
  { id: 'builder', label: 'Resume Builder', icon: '📝' },
];

export default function TabNav() {
  const { state, dispatch } = useAppState();

  return (
    <nav className="tab-nav" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          className={`tab-btn ${state.activeTab === tab.id ? 'active' : ''}`}
          role="tab"
          aria-selected={state.activeTab === tab.id}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
