
import React from 'react';

const RewardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a8.25 8.25 0 0 1-16.5 0v-8.25a8.25 8.25 0 0 1 16.5 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25v8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 11.25H8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m15 15-3 3m0 0-3-3m3 3V3a3 3 0 0 1 3 3v3.75" />
    </svg>
);

export default RewardIcon;
