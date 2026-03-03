import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

export const PasswordResetConfirmationEmail = ({
  username = '',
  loginUrl = '',
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your Tudva password has been successfully reset</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://tudva.vercel.app/_next/static/media/logo.58c53912.svg"
            width="140"
            height="70"
            alt="Tudva"
            style={logo}
          />
          <Section>
            <Text style={text}>Hi {username},</Text>
            <Text style={text}>
              This is a confirmation that your Tudva account password has been successfully reset. You can now log in with your new password.
            </Text>
            <Text style={text}>
              If you did not make this change, please contact our support team immediately as your account may have been compromised.
            </Text>

            <a href={loginUrl} style={button}>
              Log In to Your Account
            </a>

            <Hr style={divider} />

            {/* Signature */}
            <Text style={signatureText}>Best regards,</Text>
            <Text style={signatureText}><strong>The Tudva Team</strong></Text>
            <Text style={signatureText}>
              <a href="https://tudva.net" style={signatureLink}>tudva.net</a>
              {' · '}
              <a href="mailto:support@tudva.net" style={signatureLink}>support@tudva.net</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
  maxWidth: '600px',
  width: '100%',
  margin: '0 auto',
};

const logo = {
  display: 'block',
  outline: 'none',
  border: 'none',
  textDecoration: 'none',
  height: 'auto',
  marginBottom: '24px',
};

const text = {
  fontSize: '16px',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#7EAA7E',
  borderRadius: '4px',
  color: '#ffffff',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'block',
  width: '240px',
  padding: '14px 7px',
  margin: '24px 0',
};

const divider = {
  borderColor: '#f0f0f0',
  margin: '24px 0',
};

const signatureText = {
  fontSize: '14px',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
  color: '#666666',
  lineHeight: '22px',
  margin: '4px 0',
};

const signatureLink = {
  color: '#7EAA7E',
  textDecoration: 'none',
};