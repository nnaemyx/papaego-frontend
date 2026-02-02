import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface ContactEmailProps {
    name: string;
    email: string;
    message: string;
}

export const ContactEmail = ({
    name,
    email,
    message,
}: ContactEmailProps) => (
    <Html>
        <Head />
        <Preview>New Contact Inquiry from {name}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>New Contact Inquiry</Heading>
                <Section style={section}>
                    <Text style={text}>
                        <strong>Name:</strong> {name}
                    </Text>
                    <Text style={text}>
                        <strong>Email:</strong> {email}
                    </Text>
                    <Text style={text}>
                        <strong>Message:</strong>
                    </Text>
                    <Text style={messageText}>
                        {message}
                    </Text>
                </Section>
                <Text style={footer}>
                    PapaEgo Contact Form Notification
                </Text>
            </Container>
        </Body>
    </Html>
);

export default ContactEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    padding: '0 48px',
};

const section = {
    padding: '0 48px',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
};

const messageText = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
    backgroundColor: '#f4f4f4',
    padding: '12px',
    borderRadius: '4px',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    padding: '0 48px',
    marginTop: '48px',
};
