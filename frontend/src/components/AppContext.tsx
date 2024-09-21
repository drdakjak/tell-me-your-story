import React, { createContext, useState, useContext, ReactNode } from 'react';
// import { demoResume, demoJobPost, demoAnalyzedJobPost, demoAnalyzedResume, demoOriginalSections, demoTailoredSections, demoTailoredResume } from '../assets/demo';

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
  analyzedJobPost: string;
  setAnalyzedJobPost: (post: string) => void;

  resume: string;
  setResume: (resume: string) => void;
  
  analyzedResume: any[];
  setAnalyzedResume: (resume: any[]) => void;

  originalSections: any[];
  setOriginalSections: (originalSections: Section[]) => void;
  
  tailoredSections: any[];
  setTailoredSections: (tailoredSections: TailoredSection[]) => void;

  tailoredResume: string;
  setTailoredResume: (resume: string) => void;

  isUpdated: boolean;
  setIsUpdated: (isUpdated: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<string>('Job Post');
  const [jobPost, setJobPost] = useState<string>('');
  const [analyzedJobPost, setAnalyzedJobPost] = useState<string>('');
  const [resume, setResume] = useState<string>('');
  const [analyzedResume, setAnalyzedResume] = useState<any[]>([]);
  const [originalSections, setOriginalSections] = useState<Section[]>([]);
  const [tailoredSections, setTailoredSections] = useState<TailoredSection[]>([]);
  const [tailoredResume, setTailoredResume] = useState<string>('');
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      jobPost,
      setJobPost,
      analyzedJobPost,
      setAnalyzedJobPost,
      resume,
      setResume,
      analyzedResume,
      setAnalyzedResume,
      tailoredResume,
      setTailoredResume,
      originalSections,
      setOriginalSections,
      tailoredSections,
      setTailoredSections,
      isUpdated,
      setIsUpdated
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