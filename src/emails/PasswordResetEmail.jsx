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

export const PasswordResetEmail = ({
  username = '',
  resetUrl = '',
}) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Tudva account password</Preview>
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
              We received a request to reset the password for your Tudva account. Click the button below to create a new password.
            </Text>
            <Text style={text}>
              This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
            </Text>

            <a href={resetUrl} style={button}>
              Reset My Password
            </a>

            <Text style={smallText}>
              If the button above doesn't work, copy and paste this link into your browser:
            </Text>
            <Text style={linkText}>{resetUrl}</Text>

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

export default PasswordResetEmail;

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

const smallText = {
  fontSize: '13px',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
  color: '#888888',
  lineHeight: '20px',
  margin: '16px 0 4px',
};

const linkText = {
  fontSize: '13px',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
  color: '#7EAA7E',
  lineHeight: '20px',
  margin: '0',
  wordBreak: 'break-all',
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