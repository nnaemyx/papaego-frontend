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

interface WaitlistEmailProps {
    name: string;
    email: string;
    company?: string;
}

export const WaitlistEmail = ({
    name,
    email,
    company,
}: WaitlistEmailProps) => (
    <Html>
        <Head />
        <Preview>New Waitlist Submission from {name}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>New Waitlist Submission</Heading>
                <Section style={section}>
                    <Text style={text}>
                        <strong>Name:</strong> {name}
                    </Text>
                    <Text style={text}>
                        <strong>Email:</strong> {email}
                    </Text>
                    {company && (
                        <Text style={text}>
                            <strong>Company:</strong> {company}
                        </Text>
                    )}
                </Section>
                <Text style={footer}>
                    PapaEgo Waiting List Notification
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WaitlistEmail;

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

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    padding: '0 48px',
    marginTop: '48px',
};
