// src/app/live-session/[courseId]/[sessionId]/layout.jsx
'use client';

import React from 'react';

const LiveSessionLayout = ({ children }) => {
  return (
    <>
      {/* No header/footer for live sessions - full screen experience */}
      {children}
    </>
  );
};

export default LiveSessionLayout;