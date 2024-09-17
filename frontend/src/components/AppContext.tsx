import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Section {
  header: string;
  content: string;
  section_id: string;
}

interface TailoredSection {
  advice: string;
  header: string;
  content: string;
  section_id: string;
}

interface AppState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  jobPost: string;
  setJobPost: (post: string) => void;
  resume: string;
  setResume: (resume: string) => void;
  tailoredResume: string;
  setTailoredResume: (resume: string) => void;
  originalSections: any[];
  setOriginalSections: (originalSections: Section[]) => void;
  tailoredSections: any[];
  setTailoredSections: (tailoredSections: TailoredSection[]) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<string>('Job Post');
  const [jobPost, setJobPost] = useState<string>('');
  const [resume, setResume] = useState<string>('');
  const [tailoredResume, setTailoredResume] = useState<string>('');
  const [originalSections, setOriginalSections] = useState([]);
  const [tailoredSections, setTailoredSections] = useState([]);

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      jobPost,
      setJobPost,
      resume,
      setResume,
      tailoredResume,
      setTailoredResume,
      originalSections,
      setOriginalSections,
      tailoredSections,
      setTailoredSections
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};