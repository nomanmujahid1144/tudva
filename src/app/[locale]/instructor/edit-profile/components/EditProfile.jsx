// src/app/[locale]/instructor/edit-profile/components/EditProfile.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, CardBody, CardHeader, Col, Row, Form, Button } from 'react-bootstrap';
import { BsX, BsEnvelopeFill } from 'react-icons/bs';
import { FaUser, FaPhone } from 'react-icons/fa';
import { toast } from 'sonner';
import IconTextFormInput from '@/components/form/IconTextFormInput';
import defaultImage from '@/assets/images/avatar/11.jpg';
import { useAuth } from '@/context/AuthContext';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { profileSchema } from '@/validations/userSchema';
import authService from '@/services/authService';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  // Translations
  const t = useTranslations('instructor.editProfile');
  const tValidation = useTranslations('auth.validation');
  const params = useParams();
  const locale = params.locale || 'en';

  // Use auth context for user data
  const { user, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control
  } = useForm({
    resolver: yupResolver(profileSchema(tValidation)),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNo: '',
      aboutMe: '',
      profilePicture: '',
    }
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNo: user.phoneNo || '',
        aboutMe: user.aboutMe || '',
        profilePicture: user.profilePicture || '',
      });

      if (user.profilePicture) {
        setImage(user.profilePicture);
      }

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    if (!user) return;

    setSubmitting(true);

    try {
      const userData = {
        fullName: data.fullName,
        phoneNo: data.phoneNo || '',
        aboutMe: data.aboutMe || '',
        profilePicture: image,
      };

      const response = await authService.updateProfile(userData);

      if (response.success) {
        toast.success(t('success'));
        await refreshUser();
      } else {
        toast.error(response.error || t('error'));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('imageSizeError'));
        return;
      }

      // Convert to base64
      const base64String = await readFileAsDataURL(file);

      setImage(base64String);
      setValue('profilePicture', base64String);

    } catch (error) {
      console.error('Error processing image:', error);
      toast.error(t('imageProcessError'));
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = () => {
    setImage(null);
    setValue('profilePicture', '');
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <Card className="bg-transparent border rounded-3">
        <CardBody>
          <div className="text-center py-5">
            <h3 className="text-danger">{t('notAuthenticated')}</h3>
            <p>{t('notAuthenticatedMessage')}</p>
            <Button
              variant="primary"
              className="mt-3"
              href={`/${locale}/auth/sign-in`}
            >
              {t('signIn')}
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <h3 className="card-header-title mb-0">{t('title')}</h3>
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="g-4">
            {/* Profile Picture */}
            <Col xs={12} className="justify-content-center align-items-center">
              <Form.Label className="form-label">{t('profilePicture')}</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Label className="position-relative me-4" title="Replace this pic">
                  <span className="avatar avatar-xl">
                    {image ? (
                      <img
                        className="avatar-img rounded-circle border border-white border-3 shadow"
                        src={image}
                        alt="profile"
                        width={100}
                        height={100}
                        onError={(e) => {
                          console.log('Image failed to load, using default image');
                          e.target.src = defaultImage.src;
                        }}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="avatar-img rounded-circle border border-white shadow bg-light d-flex align-items-center justify-content-center mx-auto"
                        style={{ width: '100px', height: '100px', fontSize: '3rem' }}
                      >
                        {(user.fullName || 'User').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </span>
                  {image && (
                    <button
                      type="button"
                      className="uploadremove"
                      onClick={removeImage}
                    >
                      <BsX className="text-white" />
                    </button>
                  )}
                </Form.Label>
                <label className="btn btn-primary-soft mb-0" htmlFor="profilePicture">
                  {t('change')}
                </label>
                <input
                  id="profilePicture"
                  className="form-control d-none"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
              </div>
            </Col>

            {/* Basic Info */}
            <Col md={6}>
              <IconTextFormInput
                control={control}
                icon={FaUser}
                placeholder={t('fullNamePlaceholder')}
                label={`${t('fullName')} *`}
                name='fullName'
                error={errors.fullName?.message}
              />
            </Col>
            <Col md={6}>
              <IconTextFormInput
                control={control}
                icon={BsEnvelopeFill}
                placeholder={t('emailPlaceholder')}
                label={`${t('email')} *`}
                name='email'
                disabled={true}
                error={errors.email?.message}
              />
            </Col>
            <Col md={6}>
              <IconTextFormInput
                control={control}
                icon={FaPhone}
                placeholder={t('phoneNumberPlaceholder')}
                label={t('phoneNumber')}
                name='phoneNo'
                error={errors.phoneNo?.message}
              />
            </Col>

            {/* About Me */}
            <Col xs={12}>
              <Form.Label className="form-label">{t('aboutMe')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register("aboutMe")}
              />
              <div className="form-text">{t('aboutMeDescription')}</div>
            </Col>

            {/* Submit Button */}
            <Col xs={12} className="text-end">
              <Button
                type="submit"
                variant="primary"
                className="mb-0"
                disabled={submitting}
              >
                {submitting ? t('updating') : t('saveChanges')}
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};

export default EditProfile;