import * as yup from 'yup';

// User roles definition
export const UserRole = {
  Learner: "learner",
  Instructor: "instructor",
};

// Registration validation schema
export const registerSchema = (t) => yup.object({
  fullName: yup.string().required(t('fullNameRequired')),
  email: yup
    .string()
    .email(t('emailInvalid'))
    .required(t('emailRequired')),
  password: yup
    .string()
    .required(t('passwordRequired'))
    .min(8, t('passwordMinLength')),
  confirmPassword: yup
    .string()
    .required(t('confirmPasswordRequired'))
    .oneOf([yup.ref('password')], t('passwordsDontMatch')),
  role: yup
    .string()
    .oneOf(Object.values(UserRole), t('roleInvalid'))
    .required(t('roleRequired')),
  agreement: yup
    .boolean()
    .oneOf([true], t('agreementRequired'))
    .required()
});

// Login validation schema
export const loginSchema = (t) => yup.object({
  email: yup
    .string()
    .email(t('emailInvalid'))
    .required(t('emailRequired')),
  password: yup
    .string()
    .required(t('passwordRequired')),
  rememberMe: yup.boolean()
});


// Forgot password validation schema
export const forgetPasswordSchema = (t) => yup.object({
  email: yup
    .string()
    .email(t('emailInvalid'))
    .required(t('emailRequired')),
});

// Reset password validation schema
export const resetPasswordSchema = (t) => yup.object({
  password: yup
    .string()
    .required(t('passwordRequired'))
    .min(8, t('passwordMinLength')),
  confirmPassword: yup
    .string()
    .required(t('confirmPasswordRequired'))
    .oneOf([yup.ref('password')], t('passwordsDontMatch')),
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