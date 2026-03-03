import * as yup from 'yup';

export const UserRole = {
  Learner: "learner",
  Instructor: "instructor",
};

// Form-level role values — includes learner_instructor for UI only
const FORM_ROLES = ["learner", "instructor", "learner_instructor"];

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
    .oneOf(FORM_ROLES, t('roleInvalid'))
    .required(t('roleRequired')),
  agreement: yup
    .boolean()
    .oneOf([true], t('agreementRequired'))
    .required()
});

// All other schemas remain exactly the same
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

export const forgetPasswordSchema = (t) => yup.object({
  email: yup
    .string()
    .email(t('emailInvalid'))
    .required(t('emailRequired')),
});

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

export const profileSchema = (t) => yup.object({
  fullName: yup.string().required(t('fullNameRequired')),
  email: yup.string().email(t('emailInvalid')).required(t('emailRequired')),
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

export default {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  UserRole,
  profileSchema
};