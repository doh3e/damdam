'use client';

import React, { useEffect, useState } from 'react';

interface ModalProps {
  message: string;
  submessage: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function Modal({ message, submessage, onClose, children }: ModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm 
        transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center
        transform transition-all duration-300 ${visible ? 'scale-100' : 'scale-90'}`}
      >
        {/* 로고 및 메시지 */}
        <div className="flex items-center space-x-2 mb-2">
          <img src="/pixeldamdam.png" alt="담담 로고" width={36} height={36} className="mb-2 ml-2" />
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{message}</h2>
        </div>
        <p className="text-base text-gray-700 mb-6 text-center" dangerouslySetInnerHTML={{ __html: submessage }} />{' '}
        {children ? (
          children
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-center font-semibold text-white bg-[#e24b4b] hover:scale-105 transition duration-300"
          >
            확인
          </button>
        )}
      </div>
    </div>
  );
}
