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
                This is a confirmation that your Tudva account password has been successfully reset.
              </Text>
              <Text style={text}>
                You can now log in to your account using your new password.
              </Text>
              <Button style={button} href={loginUrl}>
                Log In to Your Account
              </Button>
              <Text style={text}>
                If you did not request this password change, please contact our support team immediately as your account may have been compromised.
              </Text>
              <Text style={text}>Thank you,</Text>
              <Text style={text}>The Tudva Team</Text>
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