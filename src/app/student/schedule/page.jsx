'use client';

import React from 'react';
import { SchedulerProvider } from '@/context/SchedulerContext';
import CourseScheduler from './components/CourseScheduler'

const Scheduler = () => {

  return (
    <SchedulerProvider>
      <CourseScheduler />
    </SchedulerProvider>
  );
};

export default Scheduler;