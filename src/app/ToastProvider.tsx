'use client';

import dynamic from 'next/dynamic';
import { ToastContainerProps } from 'react-toastify';

const DynamicToastContainer = dynamic<ToastContainerProps>(
  () =>
    import('react-toastify').then((mod) => ({
      default: mod.ToastContainer,
    })),
  { ssr: false }
);

export function ToastProvider() {
  return (
    <DynamicToastContainer
      position="top-right"
      theme="colored"
      autoClose={1000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
    />
  );
}
