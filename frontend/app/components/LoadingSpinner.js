"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <DotLottieReact
        src="/Heartbeat Lottie Animation.json"
        loop
        autoplay
        style={{ width: 200, height: 200 }}
      />
    </div>
  );
}
