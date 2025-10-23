'use client';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import IconTextFormInput from '@/components/form/IconTextFormInput';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { registerSchema, UserRole } from '@/validations/userSchema';
import { useAuth } from '@/context/AuthContext';

const SignUpForm = () => {
  // Use the register function and loading state from AuthContext
  const { register: registerUser, authLoading: loading } = useAuth();

  const { register, handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.Learner,
      agreement: false
    },
  });

  const onSubmit = async (data) => {
    try {
      const userData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role
      };

      // Use the register function from AuthContext
      // This will handle loading state, toast notifications, and redirects
      await registerUser(userData);
      
      // No need to manually handle success/error cases here
      // AuthContext takes care of that with the withAuthLoading helper
    } catch (err) {
      console.error('Unexpected registration error:', err);
      // This only runs if there's an unexpected error outside the normal flow
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <IconTextFormInput
          control={control}
          icon={FaUser}
          placeholder='Full Name'
          label='Full Name *'
          name='fullName'
          error={errors.fullName?.message}
        />
      </div>
      <div className="mb-3">
        <IconTextFormInput
          control={control}
          icon={FaEnvelope}
          placeholder='E-mail'
          label='Email address *'
          name='email'
          error={errors.email?.message}
        />
      </div>
      <div className="mb-3">
        <IconTextFormInput
          control={control}
          icon={FaLock}
          placeholder='*********'
          label='Password *'
          name='password'
          type="password"
          error={errors.password?.message}
        />
      </div>
      <div className="mb-3">
        <IconTextFormInput
          control={control}
          icon={FaLock}
          placeholder='*********'
          label='Confirm Password *'
          name='confirmPassword'
          type="password"
          error={errors.confirmPassword?.message}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="role" className="form-label">Role *</label>
        <Controller
          name="role"
          control={control}
          defaultValue={UserRole.Learner}
          render={({ field, fieldState }) => (
            <ChoicesFormInput
              {...field}
              className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
              allowInput={false}
              options={{
                removeItemButton: false,
              }}
            >
              <option value="" disabled>Select a role...</option>
              <option value={UserRole.Learner}>Learner</option>
              <option value={UserRole.Instructor}>Instructor</option>
            </ChoicesFormInput>
          )}
        />
        {errors.role && <div className="invalid-feedback d-block">{errors.role.message}</div>}
      </div>
      <div className="mb-3">
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id="agreement"  {...register('agreement')} />
          <label className="form-check-label" htmlFor="agreement">By signing up, you agree to the<a href="#"> terms of service</a></label>
          {errors.agreement && <div className='invalid-feedback d-block' >{errors.agreement.message}</div>}
        </div>
      </div>
      <div className="d-grid">
        <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );
};

export default SignUpForm;