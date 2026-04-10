import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = {
  activeTab: 'checker',
  // Score Checker State
  resumeFile: null,
  resumeText: '',
  jdText: '',
  inputMode: 'file', // 'file' or 'text'
  analysisResult: null,
  isAnalyzing: false,
  analysisError: null,
  // Optimizer State
  optimizerResumeText: '',
  optimizerJdText: '',
  optimizeResult: null,
  isOptimizing: false,
  optimizeError: null,
  // Builder State
  selectedTemplate: 'modern',
  resumeData: {
    personal_info: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: '',
    },
    professional_summary: '',
    experience: [
      {
        company: '',
        title: '',
        location: '',
        start_date: '',
        end_date: '',
        bullets: [''],
      },
    ],
    education: [
      {
        institution: '',
        degree: '',
        field: '',
        graduation_date: '',
        gpa: '',
      },
    ],
    skills: {
      technical: [],
      tools: [],
      soft_skills: [],
    },
    certifications: [],
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_RESUME_FILE':
      return { ...state, resumeFile: action.payload };
    case 'SET_RESUME_TEXT':
      return { ...state, resumeText: action.payload };
    case 'SET_JD_TEXT':
      return { ...state, jdText: action.payload };
    case 'SET_INPUT_MODE':
      return { ...state, inputMode: action.payload };
    case 'SET_ANALYSIS_RESULT':
      return { ...state, analysisResult: action.payload, isAnalyzing: false, analysisError: null };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload, analysisError: null };
    case 'SET_ANALYSIS_ERROR':
      return { ...state, analysisError: action.payload, isAnalyzing: false };
    case 'SET_OPTIMIZER_RESUME_TEXT':
      return { ...state, optimizerResumeText: action.payload };
    case 'SET_OPTIMIZER_JD_TEXT':
      return { ...state, optimizerJdText: action.payload };
    case 'SET_OPTIMIZE_RESULT':
      return { ...state, optimizeResult: action.payload, isOptimizing: false, optimizeError: null };
    case 'SET_OPTIMIZING':
      return { ...state, isOptimizing: action.payload, optimizeError: null };
    case 'SET_OPTIMIZE_ERROR':
      return { ...state, optimizeError: action.payload, isOptimizing: false };
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'SET_RESUME_DATA':
      return { ...state, resumeData: action.payload };
    case 'UPDATE_RESUME_DATA':
      return { ...state, resumeData: { ...state.resumeData, ...action.payload } };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}
