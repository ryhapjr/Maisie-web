import React from 'react';

interface RenderErrorProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

const RenderError: React.FC<RenderErrorProps> = ({
  icon,
  title,
  description,
}) => {
  const defaultIcon = (
    <svg
      className='w-12 h-12 text-red-500'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
      />
    </svg>
  );

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full border border-gray-200'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-4'>{icon || defaultIcon}</div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>{title}</h2>
          <p className='text-gray-600 leading-relaxed'>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default RenderError;
