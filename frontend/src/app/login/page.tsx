import React from 'react';

export default function LoginPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>

      <a href="https://your-api.com/oauth2/authorize/kakao" className="block mb-2 text-blue-500">
        카카오로 로그인
      </a>

      <a href="https://your-api.com/oauth2/authorize/naver" className="block mb-2 text-green-500">
        네이버로 로그인
      </a>

      <a href="https://your-api.com/oauth2/authorize/google" className="block text-red-500">
        구글로 로그인
      </a>
    </div>
  );
}
