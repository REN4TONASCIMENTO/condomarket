import React from 'react';

export const StoreIcon = ({ className = "h-12 w-12 text-indigo-500 mb-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
  </svg>
);

export const GoogleIcon = ({ className = "h-6 w-6 mr-3" }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M44.5 24.3H42.7V24.3C42.7 23.3 42.6 22.3 42.4 21.3H24V27.3H35.3C34.7 29.8 33.2 31.8 31 33.2V37.3H37C41.6 32.8 44.5 27.2 44.5 20.3C44.5 18.8 44.4 17.4 44.1 16H24V22H43.6C43.8 22.8 43.8 23.5 43.8 24.3H44.5Z" fill="#4285F4"/>
        <path d="M24 45C30.5 45 36 41.2 38.3 35.7L32.4 31.6C30.5 34.1 27.5 36 24 36C18.3 36 13.5 32.3 11.8 27.2H5.7V31.4C8.4 39.2 15.6 45 24 45Z" fill="#34A853"/>
        <path d="M11.8 21.8C11.3 20.3 11 18.7 11 17C11 15.3 11.3 13.7 11.8 12.2V8L5.7 3.8C3.6 7.8 2 12.2 2 17C2 21.8 3.6 26.2 5.7 30.2L11.8 26C11.3 24.5 11 22.9 11 21.2L11.8 21.8Z" fill="#FBBC05"/>
        <path d="M24 8C27.9 8 31.2 9.4 33.8 11.7L38.5 7C34.6 3.4 29.6 1 24 1C15.6 1 8.4 6.8 5.7 14.6L11.8 18.8C13.5 13.7 18.3 10 24 10V8Z" fill="#EA4335"/>
    </svg>
);

export const ArrowLeftIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export const SearchIcon = ({ className = "h-5 w-5 text-gray-400" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

export const StarIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
  </svg>
);

export const WhatsappIcon = ({ className = "h-7 w-7 mr-3" }) => (
  <svg fill="#25D366" className={className} viewBox="0 0 30 30" aria-hidden="true">
    <path d="M15 3C8.373 3 3 8.373 3 15C3 17.251208 3.6323413 19.350068 4.7109375 21.158203L3.1074219 27L9.0820312 25.431641C10.853342 26.39466 12.856534 27 15 27C21.627 27 27 21.627 27 15C27 8.373 21.627 3 15 3zM10.892578 9.4023438C11.087578 9.4023438 11.287937 9.4011562 11.458984 9.4101562C11.660984 9.4181563 11.909063 9.4316406 12.080078 9.71875C12.251094 10.005859 12.734187 11.353516 12.855469 11.580078C12.97675 11.806641 13.007812 12.053711 12.917969 12.248047C12.828125 12.442383 12.734187 12.5625 12.574219 12.722656C12.41425 12.882813 12.263672 13.03125 12.113281 13.150391C11.962891 13.269531 11.787109 13.388672 11.998047 13.785156C12.208984 14.181641 12.774414 15.011719 13.591797 15.753906C14.59375 16.669922 15.421875 17.039062 15.748047 17.208984C16.074219 17.378906 16.242188 17.347656 16.40625 17.183594C16.570312 17.019531 16.927734 16.533203 17.113281 16.261719C17.298828 15.990234 17.486328 16.011719 17.728516 16.101562C17.970703 16.191406 19.224609 16.816406 19.472656 16.941406C19.720703 17.066406 19.884766 17.128906 19.947266 17.248047C20.009766 17.367188 19.949219 17.730469 19.763672 17.916016C19.578125 18.101562 18.841797 18.691406 18.369141 19.011719C17.896484 19.332031 17.421875 19.419922 17.091797 19.441406C16.761719 19.462891 16.373047 19.513672 15.933594 19.332031C15.494141 19.150391 14.421875 18.757812 13.167969 17.652344C11.673828 16.341797 10.613281 14.683594 10.453125 14.412109C10.292969 14.140625 9.3867188 12.730469 9.3867188 11.580078C9.3867188 10.429688 10.056641 9.7890625 10.292969 9.5527344C10.529297 9.3164062 10.697656 9.4023438 10.892578 9.4023438z" />
  </svg>
);

export const LoyaltyIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5m-9-12.75v12.75m-3-3h15m-15 0a3 3 0 01-3-3V7.5a3 3 0 013-3h15a3 3 0 013 3v6a3 3 0 01-3 3m-15 0a3 3 0 003 3h9a3 3 0 003-3m-15 0V3.75" />
  </svg>
);

export const HomeIcon = ({ className = "h-6 w-6 mx-auto" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

export const ReceiptIcon = ({ className = "h-6 w-6 mx-auto" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

export const UserIcon = ({ className = "h-6 w-6 mx-auto" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export const DashboardIcon = ({ className = "h-6 w-6 mx-auto" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 00-4-4H3a2 2 0 00-2 2v6a2 2 0 002 2h2a4 4 0 004-4zm0 0V9a4 4 0 014-4h2a2 2 0 012 2v6m-6 0h6m-6 0a4 4 0 004 4h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2a4 4 0 00-4 4z" />
    </svg>
);

export const TrashIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const AlertIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.636-1.026 2.287-1.026 2.923 0l5.625 9.077c.636 1.026-.114 2.324-1.462 2.324H4.114c-1.348 0-2.098-1.298-1.462-2.324l5.605-9.077zM9 11a1 1 0 112 0v2a1 1 0 11-2 0v-2zm1-4a1 1 0 00-1 1v1a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

export const PencilIcon = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L13.196 5.232z" />
    </svg>
);
