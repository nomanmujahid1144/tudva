// src/app/[locale]/instructor/edit-profile/components/EditProfilePage.jsx
'use client';

import React from 'react';
import EditProfile from './EditProfile';
import ProtectedRoute from '@/components/ProtectedRoute';

const EditProfilePage = () => {
  return (
    <ProtectedRoute allowedRoles={['instructor', 'admin']}>
      <EditProfile />
    </ProtectedRoute>
  );
};

export default EditProfilePage;