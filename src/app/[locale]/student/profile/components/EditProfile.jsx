// src/app/components/EditProfile.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, CardBody, CardHeader, Col, Row, Form, Button } from 'react-bootstrap';
import { BsPlus, BsX, BsTrash, BsEnvelopeFill } from 'react-icons/bs';
import { FaUser, FaPhone } from 'react-icons/fa';
import { toast } from 'sonner';
import IconTextFormInput from '@/components/form/IconTextFormInput';
import defaultImage from '../../../../../assets/images/avatar/11.jpg';
import { useAuth } from '@/context/AuthContext';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { profileSchema } from '@/validations/userSchema';
import authService from '@/services/authService';

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  
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
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNo: '',
      aboutMe: '',
      education: [{ degree: '', institution: '' }],
      profilePicture: '',
    }
  });

  // Use useFieldArray for the education field
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Process education data - ensure it's an array of objects
      let educationData = [{ degree: '', institution: '' }];
      
      if (user.education) {
        if (Array.isArray(user.education)) {
          educationData = user.education.map(edu => ({
            degree: edu.degree || '',
            institution: edu.institution || '',
          }));
        } else if (typeof user.education === 'string') {
          try {
            const parsed = JSON.parse(user.education);
            if (Array.isArray(parsed)) {
              educationData = parsed.map(edu => ({
                degree: edu.degree || '',
                institution: edu.institution || '',
              }));
            }
          } catch (e) {
            console.error('Failed to parse education data:', e);
          }
        }
      }

      // If there's no education data, provide a default empty item
      if (educationData.length === 0) {
        educationData = [{ degree: '', institution: '' }];
      }

      // Set form values with user data
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNo: user.phoneNo || '',
        aboutMe: user.aboutMe || '',
        education: educationData,
        profilePicture: user.profilePicture || '',
      });

      // Set profile image
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
      // Prepare the user data to update
      const userData = {
        fullName: data.fullName,
        phoneNo: data.phoneNo || '',
        aboutMe: data.aboutMe || '',
        education: data.education.filter(edu => edu.degree || edu.institution),
        profilePicture: image,
      };
      
      // API call to update profile
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        toast.success('Profile updated successfully');
        
        // Refresh user data in context
        await refreshUser();
      } else {
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Image size exceeds 5MB');
        return;
      }
      
      // Convert to base64
      const base64String = await readFileAsDataURL(file);
      
      // Set image state and form value
      setImage(base64String);
      setValue('profilePicture', base64String);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    }
  };
  
  // Helper function to read file as data URL
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
            <h3 className="text-danger">Not Authenticated</h3>
            <p>Please log in to access your profile.</p>
            <Button 
              variant="primary" 
              className="mt-3"
              href="/auth/sign-in"
            >
              Sign In
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <h3 className="card-header-title mb-0">Edit Profile</h3>
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="g-4">
            {/* Profile Picture */}
            <Col xs={12} className="justify-content-center align-items-center">
              <Form.Label className="form-label">Profile picture</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Label className="position-relative me-4" title="Replace this pic">
                  <span className="avatar avatar-xl">
                    <img
                      className="avatar-img rounded-circle border border-white border-3 shadow"
                      src={image || defaultImage.src}
                      alt="profile"
                      width={100}
                      height={100}
                      onError={(e) => {
                        console.log('Image failed to load, using default image');
                        e.target.src = defaultImage.src;
                      }}
                      style={{ objectFit: 'cover' }}
                    />
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
                  Change
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
                placeholder='Full Name'
                label='Full Name *'
                name='fullName'
                error={errors.fullName?.message}
              />
            </Col>
            <Col md={6}>
              <IconTextFormInput
                control={control}
                icon={BsEnvelopeFill}
                placeholder='E-mail'
                label='Email address *'
                name='email'
                disabled={true}
                error={errors.email?.message}
              />
            </Col>
            <Col md={6}>
              <IconTextFormInput
                control={control}
                icon={FaPhone}
                placeholder='Phone Number'
                label='Phone number'
                name='phoneNo'
                error={errors.phoneNo?.message}
              />
            </Col>

            {/* About Me */}
            <Col xs={12}>
              <Form.Label className="form-label">About me</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register("aboutMe")}
              />
              <div className="form-text">Brief description for your profile.</div>
            </Col>

            {/* Education */}
            <Col xs={12}>
              <Form.Label className="form-label">Education</Form.Label>
              {fields.map((item, index) => (
                <Row key={item.id} className="mb-3">
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      placeholder="Degree"
                      {...register(`education.${index}.degree`)}
                    />
                    {errors.education?.[index]?.degree && (
                      <div className="invalid-feedback d-block">
                        {errors.education[index].degree.message}
                      </div>
                    )}
                  </Col>
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      placeholder="Institution"
                      {...register(`education.${index}.institution`)}
                    />
                    {errors.education?.[index]?.institution && (
                      <div className="invalid-feedback d-block">
                        {errors.education[index].institution.message}
                      </div>
                    )}
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      variant="danger"
                      onClick={() => fields.length > 1 && remove(index)}
                      type="button"
                    >
                      <BsTrash />
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button
                variant="light"
                size="sm"
                onClick={() => append({ degree: '', institution: '' })}
                type="button"
                className="mb-0"
              >
                <BsPlus className="me-1" />Add more
              </Button>
            </Col>

            {/* Submit Button */}
            <Col xs={12} className="text-end">
              <Button 
                type="submit" 
                variant="primary" 
                className="mb-0" 
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};

export default EditProfile;