'use client';

import React from 'react';
import EditProfile from '../profile/components/EditProfile';
import LinkedAccount from '../profile/components/LinkedAccount';
import SocialMedia from '../profile/components/SocialMedia';
import EmailChange from '../profile/components/EmailChange';
import PasswordChange from '../profile/components/PasswordChange';
import { Row } from 'react-bootstrap';
import ProtectedRoute from '@/components/ProtectedRoute';

const EditProfilePage = () => {
  return (
    <ProtectedRoute allowedRoles={['instructor', 'admin']}>
      <EditProfile />
      {/* <Row className="g-4 mt-3">
        <LinkedAccount />
        <SocialMedia />
        <EmailChange />
        <PasswordChange />
      </Row> */}
    </ProtectedRoute>
  );
};

export default EditProfilePage;
