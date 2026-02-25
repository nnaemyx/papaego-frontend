import { Resend } from 'resend';
import { WaitlistEmail } from '@/emails/waitlist-email';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, company } = await req.json();

        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }

        const data = await resend.emails.send({
            from: 'PapaEgo <careers@papaego.com>',
            to: email,
            subject: 'New Waitlist Submission',
            react: WaitlistEmail({ name, email, company }),
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
