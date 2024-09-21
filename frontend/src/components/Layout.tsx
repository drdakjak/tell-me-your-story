import React, { useMemo, useEffect, useState } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import JobPostProcessor from '../routes/JobPostProcessor';
import ResumeProcessor from '../routes/ResumeProcessor';
import TailoredResume from '../routes/TailoredResume';
import Editor from '../routes/Editor';
import { useAppContext } from './AppContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { PiBriefcaseLight, PiUserCircleThin, PiClipboardTextLight } from "react-icons/pi";
import { HiAdjustmentsVertical } from "react-icons/hi2";
import { GrFormNext } from "react-icons/gr";
import avatar from 'animal-avatar-generator'
import { PiCircleNotchFill } from "react-icons/pi";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { get } from 'aws-amplify/api';
import initDemoUser from './InitUserData';
import { Spinner } from "flowbite-react";

const user = {
  name: '',
  email: '',
  imageUrl: '',
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
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


  const fetchUser = async () => {
    console.log('Fetching user');
    try {
      const { body } = await get({
        apiName: 'Api',
        path: 'fetch_user',
      }).response;
      const response = await body.json();
      setUserData(response);
      setIsUserDataFetched(true); // Indicate that user data has been fetched
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      console.log('User fetched');
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
    // Set the initial currentPage based on the URL
    const path = location.pathname.slice(1); // Remove the leading '/'
    if (path === 'job-post') setCurrentPage('Job Post');
    else if (path === 'resume') setCurrentPage('Resume');
    else if (path === 'editor') setCurrentPage('Editor');
    else if (path === 'tailored-resume') setCurrentPage('Tailored Resume');
  }, [location, setCurrentPage]);
  
  const navigation = useMemo(() => [
    { name: 'Job Post', icon: PiBriefcaseLight, action: () => setCurrentPage('Job Post'), disabled: false },
    { name: 'Resume', icon: PiUserCircleThin, action: () => setCurrentPage('Resume'), disabled: !analyzedJobPost },
    { name: 'Editor', icon: HiAdjustmentsVertical, action: () => setCurrentPage('Editor'), disabled: !analyzedJobPost || !analyzedResume.length },
    { name: 'Tailored Resume', icon: PiClipboardTextLight, action: () => setCurrentPage('Tailored Resume'), disabled: !analyzedJobPost || !analyzedResume || !tailoredSections.length },
  ], [analyzedJobPost, analyzedResume, tailoredSections, setCurrentPage]);

  const currentPageIndex = navigation.findIndex(item => item.name === currentPage);

  const generateRandomAvatar = () => {
    
    const { user } = useAuthenticator((context) => [context.user]);
    const avatar_svg = avatar(user.username, { size: 200 })
    return avatar_svg;
  }
  user.imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(generateRandomAvatar())}`

  

  return (

    <div className="min-h-screen bg-secondary-50">
      <Disclosure as="nav" className="bg-primary-800 shadow-lg">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <button
                      onClick={() => {
                        setCurrentPage('Home');
                        navigate('/');
                      }}
                      className="hover:scale-125"
                    >
                      <PiCircleNotchFill className='h-7 w-7 rotate-90 fill-secondary-200' />
                    </button>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item, index) => (
                      <a
                        key={item.name}
                        onClick={() => !item.disabled && item.action()}
                        className={classNames(
                          item.name === currentPage
                            ? 'border-accent-500 text-secondary-100 border-b-4  mt-1 shadow-lg'
                            : item.disabled
                              ? 'border-transparent text-primary-600 cursor-not-allowed'
                              : 'border-transparent text-secondary-200 hover:border-primary-300 hover:text-secondary-100 cursor-pointer',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-base font-medium transition duration-150 ease-in-out'
                        )}
                      >
                        <span className="mr-2">{index + 1}.</span>
                        {item.icon && <item.icon className="h-5 w-5 mr-1" />}
                        {item.name}
                        {index < navigation.length - 1 && (
                          <GrFormNext className="ml-8"></GrFormNext>
                        )}

                      </a>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <MenuButton className="flex rounded-full bg-primary-700 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:ring-accent-500  hover:scale-125">
                        <span className="sr-only">Open user menu</span>
                        <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" />
                      </MenuButton>
                    </div>
                    <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuItem key='Sign out'>
                        {({ active }) => (
                          <button
                            onClick={signOut}
                            className={classNames(
                              active ? 'bg-secondary-100' : '',
                              'block px-4 py-2 text-sm text-secondary-700 w-full text-left'
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-primary-100 hover:bg-primary-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
              </div>
            </div>

            <DisclosurePanel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item, index) => (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    onClick={() => !item.disabled && item.action()}
                    className={classNames(
                      item.name === currentPage
                        ? 'bg-primary-800 border-accent-500 text-white'
                        : item.disabled
                          ? 'border-transparent text-primary-300 cursor-not-allowed'
                          : 'border-transparent text-primary-100 hover:bg-primary-600 hover:border-primary-300 hover:text-white cursor-pointer',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition duration-150 ease-in-out'
                    )}
                  >
                    <span className="mr-2">{index + 1}.</span>
                    {item.name}
                    {index < currentPageIndex && (
                      <CheckCircleIcon className="ml-2 inline-block h-5 w-5 text-green-400" />
                    )}
                  </DisclosureButton>
                ))}
              </div>
              <div className="border-t border-primary-600 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0 ">
                    <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt="" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name}</div>
                    <div className="text-sm font-medium text-primary-300">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <DisclosureButton
                    as="button"
                    onClick={signOut}
                    className="block w-full px-4 py-2 text-base font-medium text-primary-100 hover:bg-primary-600 hover:text-white"
                  >
                    Sign out
                  </DisclosureButton>
                </div>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-1 w-full bg-gray-200 rounded-full mb-6">
              <div
                className="h-full bg-accent-500 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentPageIndex + 1) / navigation.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </header>
        <main>
          
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Spinner className="h-7 w-7"></Spinner>
        </div>
      )}
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