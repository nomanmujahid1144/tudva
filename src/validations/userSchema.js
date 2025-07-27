import * as yup from 'yup';

// User roles definition
export const UserRole = {
  Learner: "learner",
  Instructor: "instructor",
};

// Registration validation schema
export const registerSchema = yup.object({
  fullName: yup.string().required('Please enter your Full Name'),
  email: yup.string().email('Please enter a valid email').required('Please enter your Email'),
  password: yup.string().required('Please enter your Password').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your Password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup.string().oneOf(Object.values(UserRole), 'Please select a valid role').required('Please select a role'),
  agreement: yup.boolean().oneOf([true], "You must accept terms of service").required()
});

// Login validation schema
export const loginSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Please enter your Email'),
  password: yup.string().required('Please enter your Password'),
  rememberMe: yup.boolean()
});

// Forgot password validation schema
export const forgetPasswordSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Please enter your Email'),
});

// Reset password validation schema
export const resetPasswordSchema = yup.object({
  password: yup.string().required('Please enter your Password').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your Password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

// Profile validation schema
export const profileSchema = yup.object({
  fullName: yup.string().required('Please enter your full name'),
  email: yup.string().email('Please enter a valid email').required('Please enter your email'),
  phoneNo: yup.string().nullable(),
  aboutMe: yup.string().nullable(),
  profilePicture: yup.string().nullable(),
  education: yup.array().of(
    yup.object({
      degree: yup.string(),
      institution: yup.string(),
    })
  ).nullable(),
});

// Export all schemas
export default {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  UserRole,
  profileSchema
};