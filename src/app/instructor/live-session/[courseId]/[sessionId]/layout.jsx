// src/app/instructor/live-session/[courseId]/[sessionId]/layout.jsx
'use client';

import React from 'react';

const InstructorLiveSessionLayout = ({ children }) => {
  return (
    <>
      {/* No header/footer for instructor live sessions - full screen experience */}
      {children}
    </>
  );
};

export default InstructorLiveSessionLayout;