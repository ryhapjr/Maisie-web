export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full border border-gray-200 min-w-[500px] min-h-[300px] flex items-center justify-center flex-col'>
    {children}
  </div>
);
