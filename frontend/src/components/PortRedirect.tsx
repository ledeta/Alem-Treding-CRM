'use client';

import { useEffect } from 'react';

export default function PortRedirect() {
  useEffect(() => {
    // DISABLED: Port redirect causing issues with 127.0.0.1:3000
    // This component is kept for backward compatibility but does nothing
    // Users should access the app directly on http://127.0.0.1:3000
  }, []);

  return null; // This component doesn't render anything
}
