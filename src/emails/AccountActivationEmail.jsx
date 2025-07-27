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
  
  export const AccountActivatedEmail = ({
    username = '',
    loginUrl = '',
  }) => {
    return (
      <Html>
        <Head />
        <Preview>Your Tudva account has been successfully activated!</Preview>
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
                Great news! Your Tudva account has been successfully activated. Thank you for verifying your email address.
              </Text>
              <Text style={text}>
                You can now access all features of the platform and begin your learning journey.
              </Text>
              <Button style={button} href={loginUrl}>
                Log In to Your Account
              </Button>
              <Text style={text}>
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </Text>
              <Text style={text}>Welcome to Tudva and happy learning!</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default AccountActivatedEmail;
  
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