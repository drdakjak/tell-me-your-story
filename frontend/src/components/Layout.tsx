import React, { useMemo } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import JobPostProcessor from './JobPostProcessor';
import ResumeProcessor from './ResumeProcessor';
import TailoredResume from './TailoredResume';
import Editor from './Editor';
import { useAppContext } from './AppContext';
import { AvatarGenerator } from 'random-avatar-generator';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { PiBriefcaseLight, PiUserCircleThin, PiClipboardTextLight} from "react-icons/pi";
import { HiAdjustmentsVertical} from "react-icons/hi2";
import { GrFormNext } from "react-icons/gr";
import avatar from 'animal-avatar-generator'

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Layout: React.FC<{ signOut: () => void }> = ({ signOut }) => {
  const { 
    currentPage, setCurrentPage,
    jobPost, setJobPost,
    resume, setResume,
    tailoredResume, setTailoredResume,
    originalSections, setOriginalSections,
    tailoredSections, setTailoredSections
  } = useAppContext();
  
  const navigation = useMemo(() => [
    { name: 'Job Post', icon: PiBriefcaseLight, action: () => setCurrentPage('Job Post'), disabled: false },
    { name: 'Resume', icon: PiUserCircleThin, action: () => setCurrentPage('Resume'), disabled: !jobPost },
    { name: 'Editor', icon: HiAdjustmentsVertical, action: () => setCurrentPage('Editor'), disabled: !resume },
    { name: 'Tailored Resume', icon: PiClipboardTextLight, action: () => setCurrentPage('Tailored Resume'), disabled: !jobPost || !resume || !tailoredSections },
  ], [jobPost, resume, tailoredSections, setCurrentPage]);

  const currentPageIndex = navigation.findIndex(item => item.name === currentPage);
  const generateRandomAvatar = () => {

    const { user } = useAuthenticator((context) => [context.user]);
    const avatar_svg = avatar(user.username, { size: 200 })
    return avatar_svg;
  }
  user.imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(generateRandomAvatar())}`

  return (
    <div className="min-h-screen bg-secondary-50">
      <Disclosure as="nav" className="bg-primary-700 shadow-lg">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <img
                    // TODO: Replace with your company logo
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                      alt="Your Company"
                    />
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item, index) => (
                      <a
                        key={item.name}
                        onClick={() => !item.disabled && item.action()}
                        className={classNames(
                          item.name === currentPage
                            ? 'border-accent-500 text-white'
                            : item.disabled
                            ? 'border-transparent text-primary-300 cursor-not-allowed'
                            : 'border-transparent text-primary-100 hover:border-primary-300 hover:text-white cursor-pointer',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition duration-150 ease-in-out'
                        )}
                      >
                        <span className="mr-2">{index + 1}.</span>
                        {item.icon && <item.icon className="h-5 w-5 mr-1" />}
                        {item.name}
                        {/* {index < currentPageIndex && (
                          <CheckCircleIcon className="ml-2 h-5 w-5 text-green-400" />
                        )} */}
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
                      <MenuButton className="flex rounded-full bg-primary-700 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2">
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
                  <div className="flex-shrink-0">
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
            <div className="h-2 w-full bg-gray-200 rounded-full mb-6">
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
                  {currentPage === 'Job Post' && <JobPostProcessor jobPost={jobPost} setJobPost={setJobPost} setCurrentPage={setCurrentPage}/>}
                  {currentPage === 'Resume' && <ResumeProcessor resume={resume} setResume={setResume} setCurrentPage={setCurrentPage}/>}
                  {currentPage === 'Editor' && <Editor
                    originalSections={originalSections}
                    setOriginalSections={setOriginalSections}
                    tailoredSections={tailoredSections}
                    setTailoredSections={setTailoredSections}
                    setCurrentPage={setCurrentPage}
                  />}
                  {currentPage === 'Tailored Resume' && <TailoredResume tailoredResume={tailoredResume} setTailoredResume={setTailoredResume} setCurrentPage={setCurrentPage}/>}
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