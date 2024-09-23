import React, { useMemo, useEffect, useState } from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import JobPostProcessor from '../routes/JobPostProcessor';
import ResumeProcessor from '../routes/ResumeProcessor';
import TailoredResume from '../routes/TailoredResume';
import Editor from '../routes/Editor';
import { useAppContext } from './AppContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { PiBriefcaseLight, PiUserCircleThin, PiClipboardTextLight, PiCircleNotchBold } from "react-icons/pi";
import { HiAdjustmentsVertical } from "react-icons/hi2";
import avatar from 'animal-avatar-generator';
import { useLocation, useNavigate } from 'react-router-dom';
import { get } from 'aws-amplify/api';
import initDemoUser from './InitUserData';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Layout: React.FC<{ signOut: () => void }> = ({ signOut }) => {
  const {
    currentPage, setCurrentPage,
    jobPost, setJobPost,
    analyzedJobPost, setAnalyzedJobPost,
    resume, setResume,
    analyzedResume, setAnalyzedResume,
    originalSections, setOriginalSections,
    tailoredSections, setTailoredSections,
    tailoredResume, setTailoredResume,
    isUpdated, setIsUpdated
  } = useAppContext();

  const [userData, setUserData] = useState<any>(null);
  const [isUserDataFetched, setIsUserDataFetched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthenticator((context) => [context.user]);

  const fetchUser = async () => {
    try {
      const { body } = await get({ apiName: 'Api', path: 'fetch_user' }).response;
      const response = await body.json();
      setUserData(response);
      setIsUserDataFetched(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await initDemoUser();
      await fetchUser();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (isUserDataFetched && userData) {
      setJobPost(userData.job_post || '');
      setAnalyzedJobPost(userData.job_requirements || '');
      setResume(userData.original_resume || '');
      setAnalyzedResume(userData.semantic_sections || []);
      setOriginalSections(userData.semantic_sections || []);
      setTailoredSections(userData.tailored_sections || []);
      setTailoredResume(userData.tailored_resume || '');
    }
  }, [isUserDataFetched, userData]);

  useEffect(() => {
    const path = location.pathname.slice(1);
    if (path === 'job-post') setCurrentPage('Job Post');
    else if (path === 'resume') setCurrentPage('Resume');
    else if (path === 'editor') setCurrentPage('Editor');
    else if (path === 'tailored-resume') setCurrentPage('Tailored Resume');
  }, [location, setCurrentPage]);

  const navigation = useMemo(() => [
    { name: 'Job Post', icon: PiBriefcaseLight, action: () => navigate('/job-post'), disabled: false },
    { name: 'Resume', icon: PiUserCircleThin, action: () => navigate('/resume'), disabled: !analyzedJobPost },
    { name: 'Editor', icon: HiAdjustmentsVertical, action: () => navigate('/editor'), disabled: !analyzedJobPost || !analyzedResume.length },
    { name: 'Tailored Resume', icon: PiClipboardTextLight, action: () => navigate('/tailored-resume'), disabled: !analyzedJobPost || !analyzedResume || !tailoredSections.length },
  ], [analyzedJobPost, analyzedResume, tailoredSections, navigate]);

  const currentPageIndex = navigation.findIndex(item => item.name === currentPage);

  const userAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(avatar(user.username, { size: 200 }))}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Disclosure as="nav" className="bg-white shadow">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <button
                      onClick={() => {
                        setCurrentPage('Home');
                        navigate('/');
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <PiCircleNotchBold className="h-8 w-8 rotate-90" />
                    </button>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item, index) => (
                      <a
                        key={item.name}
                        onClick={() => !item.disabled && item.action()}
                        className={classNames(
                          item.name === currentPage
                            ? 'border-blue-500 text-gray-900'
                            : item.disabled
                              ? 'border-transparent text-gray-400 cursor-not-allowed'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors'
                        )}
                      >
                        {item.icon && <item.icon className="h-5 w-5 mr-1" />}
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <img className="h-8 w-8 rounded-full" src={userAvatar} alt="" />
                      </Menu.Button>
                    </div>
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={signOut}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700 w-full text-left'
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    onClick={() => !item.disabled && item.action()}
                    className={classNames(
                      item.name === currentPage
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : item.disabled
                          ? 'border-transparent text-gray-400 cursor-not-allowed'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 cursor-pointer',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors'
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src={userAvatar} alt="" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.username}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as="button"
                    onClick={signOut}
                    className="block w-full px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-2 w-full bg-gray-200 rounded-full mb-6">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentPageIndex + 1) / navigation.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="rounded-lg bg-white shadow-sm">
                <div className="px-4 py-5 sm:p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <div className="mr-4">
                    Loading demo data...
                  </div>
                      <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    <>
                      {currentPage === 'Job Post' && (
                        <JobPostProcessor
                          jobPost={jobPost}
                          setJobPost={setJobPost}
                          analyzedJobPost={analyzedJobPost}
                          setAnalyzedJobPost={setAnalyzedJobPost}
                          setTailoredSections={setTailoredSections}
                          setCurrentPage={setCurrentPage}
                        />
                      )}
                      {currentPage === 'Resume' && (
                        <ResumeProcessor
                          resume={resume}
                          setResume={setResume}
                          analyzedResume={analyzedResume}
                          setAnalyzedResume={setAnalyzedResume}
                          setTailoredSections={setTailoredSections}
                          setCurrentPage={setCurrentPage}
                        />
                      )}
                      {currentPage === 'Editor' && (
                        <Editor
                          originalSections={originalSections}
                          setOriginalSections={setOriginalSections}
                          tailoredSections={tailoredSections}
                          setTailoredSections={setTailoredSections}
                          setCurrentPage={setCurrentPage}
                          setIsUpdated={setIsUpdated}
                        />
                      )}
                      {currentPage === 'Tailored Resume' && (
                        <TailoredResume
                          tailoredResume={tailoredResume}
                          setTailoredResume={setTailoredResume}
                          isUpdated={isUpdated}
                          setIsUpdated={setIsUpdated}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;