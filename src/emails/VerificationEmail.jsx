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
  
  export const VerificationEmail = ({
    username = '',
    url = '',
  }) => {
    return (
      <Html>
        <Head />
        <Preview>Verify your email for Tudva</Preview>
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
                Welcome to Tudva! To complete your sign-up process and verify your email address,
                please click the button below. This will confirm that this email belongs to you and activate your account:
              </Text>
              <Button style={button} href={url}>
                Verify Email
              </Button>
              <Text style={text}>
                If the button doesn't work, please copy the link below
                and paste it into your browser to complete the verification process.
              </Text>
              <Text style={text}>{url}</Text>
              <Text style={text}>Happy Tudva!</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default VerificationEmail;
  
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