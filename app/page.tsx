import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
        <div className='flex gap-4 items-center flex-col sm:flex-row'>
          <Link
            href={`/launch?iss=https://connect.pointclickcare.com/fhir/R4/6f931546-92c8-41d6-9da4-e59cc5926726&launch=4ac46f9e-9eaa-4789-97c0-c920520abb86`}
            className='bg-black text-white rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]'
          >
            <Image
              className='dark:invert'
              src='/vercel.svg'
              alt='Vercel logomark'
              width={20}
              height={20}
            />
            Test Launch
          </Link>
          <Link
            href='/api-docs'
            className='rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]'
          >
            API Docs
          </Link>
        </div>
      </main>
    </div>
  );
}
