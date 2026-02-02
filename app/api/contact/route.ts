import { Resend } from 'resend';
import { ContactEmail } from '@/emails/contact-email';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        const data = await resend.emails.send({
            from: 'PapaEgo <onboarding@resend.dev>',
            to: [process.env.NOTIFICATION_EMAIL || 'hello@papaego.com'],
            subject: 'New Contact Inquiry',
            react: ContactEmail({ name, email, message }),
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
