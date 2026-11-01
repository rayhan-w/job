import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback test transporter (Ethereal test email account)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const transporter = await getEmailTransporter();
  const from = process.env.SMTP_FROM || '"WOJOB Portal" <no-reply@wojob.com>';

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: text || html.replace(/<[^>]*>/g, ""),
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`[Email] Message sent to ${to}: ${info.messageId}`);
  if (previewUrl) {
    console.log(`[Email] Preview URL: ${previewUrl}`);
  }

  return {
    success: true,
    messageId: info.messageId,
    previewUrl: previewUrl || undefined,
  };
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string, name?: string) {
  const subject = "পাসওয়ার্ড রিসেট লিংক — WOJOB Job Portal";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; rounded: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #ea580c; margin: 0;">WOJOB</h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Career & Recruitment Platform</p>
      </div>
      <p style="font-size: 15px; color: #111827;">প্রিয় ${name || "ব্যবহারকারী"},</p>
      <p style="font-size: 14px; color: #374151; line-height: 1.6;">
        আপনার WOJOB অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য একটি অনুরোধ পাওয়া গেছে। আপনার নতুন পাসওয়ার্ড সেট করতে নিচের বাটনে ক্লিক করুন:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #ea580c; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px; display: inline-block;">
          নতুন পাসওয়ার্ড সেট করুন
        </a>
      </div>
      <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">
        যদি বাটন কাজ না করে, নিচের লিংকটি কপি করে আপনার ব্রাউজারে পেস্ট করুন:<br/>
        <a href="${resetUrl}" style="color: #ea580c; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
        * এই লিংকটি ৩০ মিনিট পর্যন্ত কার্যকর থাকবে এবং একবার ব্যবহারের পর নিষ্ক্রিয় হয়ে যাবে। আপনি যদি এই অনুরোধ না করে থাকেন, তবে বার্তাটি উপেক্ষা করুন।
      </p>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(toEmail: string, name?: string) {
  const subject = "WOJOB প্ল্যাটফর্মে স্বাগতম!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #ea580c; margin: 0;">WOJOB</h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Career & Recruitment Platform</p>
      </div>
      <p style="font-size: 15px; color: #111827;">প্রিয় ${name || "ব্যবহারকারী"},</p>
      <p style="font-size: 14px; color: #374151; line-height: 1.6;">
        WOJOB প্ল্যাটফর্মে আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন আপনি সরকারি ও বেসরকারি চাকরির বিজ্ঞপ্তি দেখতে পারবেন, সরাসরি ১-ক্লিকে আবেদন করতে পারবেন এবং কুইজ প্রতিযোগিতায় অংশ নিয়ে ক্যাশ বোনাস জিততে পারবেন।
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://job-portal-bd-six.vercel.app/dashboard" style="background-color: #10b981; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px; display: inline-block;">
          আপনার ড্যাশবোর্ডে প্রবেশ করুন
        </a>
      </div>
      <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">
        যেকোনো প্রয়োজনে আমাদের হেল্পলাইনে যোগাযোগ করতে পারেন।
      </p>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
}
