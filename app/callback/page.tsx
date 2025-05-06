'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const Callback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This component's only purpose is to redirect back to the launch page
    // after PCC redirects to the redirect URI.  The launch page's useEffect
    // will then process the authorization code.
    router.push(`/launch?${searchParams.toString()}`);
  }, [router, searchParams]);

  return <p>Redirecting...</p>;
};

const CallbackMain = () => {
  return (
    <Suspense>
      <Callback />
    </Suspense>
  );
};

export default CallbackMain;
