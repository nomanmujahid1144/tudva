import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
  } from '@react-email/components';
  import * as React from 'react';
  
  export const PasswordResetEmail = ({
    username = '',
    resetUrl = '',
  }) => {
    return (
      <Html>
        <Head />
        <Preview>Reset your password for Tudva</Preview>
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
                We received a request to reset your password for your Tudva account. To proceed with resetting your password, please click the button below:
              </Text>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
              <Text style={text}>
                If the button doesn't work, please copy the link below
                and paste it into your browser:
              </Text>
              <Text style={text}>{resetUrl}</Text>
              <Text style={text}>
                This password reset link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </Text>
              <Text style={text}>
                For security reasons, please don't share this link with anyone.
              </Text>
              <Text style={text}>Thank you,</Text>
              <Text style={text}>The Tudva Team</Text>
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
    maxWidth: '37.5em',
  };
  
  const logo = {
    display: 'block',
    outline: 'none',
    border: 'none',
    textDecoration: 'none',
    height: 'auto',
  };
  
  const text = {
    fontSize: '16px',
    fontFamily: "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
    fontWeight: '300',
    color: '#404040',
    lineHeight: '26px',
    margin: '16px 0',
  };
  
  const button = {
    backgroundColor: '#007ee6',
    borderRadius: '4px',
    color: '#fff',
    fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
    fontSize: '15px',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    width: '210px',
    padding: '14px 7px',
  };