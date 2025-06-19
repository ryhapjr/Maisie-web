import { cn } from '@/lib/utils';

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-lg p-8 max-w-md w-full border border-gray-200 min-w-[500px] min-h-[200px] flex items-center justify-center flex-col',
        className
      )}
    >
      {children}
    </div>
  );
};
