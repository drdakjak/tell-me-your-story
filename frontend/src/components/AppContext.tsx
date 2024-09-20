import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { demoResume, demoJobPost, demoAnalyzedJobPost, demoAnalyzedResume, demoOriginalSections, demoTailoredSections, demoTailoredResume } from '../assets/demo';
import { put } from 'aws-amplify/api';
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
  const [jobPost, setJobPost] = useState<string>(demoJobPost);
  const [analyzedJobPost, setAnalyzedJobPost] = useState<string>(demoAnalyzedJobPost);
  const [resume, setResume] = useState<string>(demoResume);
  const [analyzedResume, setAnalyzedResume] = useState<any[]>(demoAnalyzedResume);
  const [originalSections, setOriginalSections] = useState<Section[]>(demoOriginalSections);
  const [tailoredSections, setTailoredSections] = useState<TailoredSection[]>(demoTailoredSections);
  const [tailoredResume, setTailoredResume] = useState<string>(demoTailoredResume);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);


  const updateUser = async () => {
    try {
      const { body } = await put({
        apiName: 'Api',
        path: 'update_user',
        options: {
          body: {
            jobPost: jobPost,
            analyzedJobPost: analyzedJobPost,
            originalResume: resume,
            originalSections: originalSections,
            tailoredSections: tailoredSections
          }
        }
      }).response;
      const response = await body.json();
      console.log(response);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      console.log('Update done');
    }
  };

  useEffect(() => {
    updateUser();
  }, [jobPost, analyzedJobPost, resume, originalSections, tailoredSections]);

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