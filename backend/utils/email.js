const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Send email when someone applies to a job
exports.sendApplicationEmail = async (recruiterEmail, applicantName, jobTitle) => {
  try {
    await transporter.sendMail({
      from: `"HireAI" <${process.env.EMAIL_USER}>`,
      to: recruiterEmail,
      subject: `New Application for ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">HireAI</h1>
          </div>
          <div style="background: #18181b; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #3f3f46;">
            <h2 style="color: #ffffff;">New Application Received! 🎉</h2>
            <p style="color: #a1a1aa;">You have a new application for your job posting.</p>
            <div style="background: #27272a; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #ffffff; margin: 5px 0;"><strong>Job:</strong> ${jobTitle}</p>
              <p style="color: #ffffff; margin: 5px 0;"><strong>Applicant:</strong> ${applicantName}</p>
            </div>
            <a href="https://hireai-job-portal.vercel.app/applications" 
               style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 10px;">
              View Application
            </a>
          </div>
        </div>
      `,
    });
    console.log("Application email sent!");
  } catch (err) {
    console.error("Email error:", err);
  }
};

// Send email when application status changes
exports.sendStatusUpdateEmail = async (applicantEmail, applicantName, jobTitle, status) => {
  const statusMessages = {
    reviewing: "Your application is being reviewed! 👀",
    shortlisted: "Great news! You've been shortlisted! 🌟",
    interview: "You've been selected for an interview! 🎯",
    offered: "Congratulations! You've received a job offer! 🎉",
    rejected: "Unfortunately, your application was not selected this time.",
  };

  const message = statusMessages[status] || "Your application status has been updated.";

  try {
    await transporter.sendMail({
      from: `"HireAI" <${process.env.EMAIL_USER}>`,
      to: applicantEmail,
      subject: `Application Update: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">HireAI</h1>
          </div>
          <div style="background: #18181b; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #3f3f46;">
            <h2 style="color: #ffffff;">Application Update 📬</h2>
            <p style="color: #a1a1aa;">Hi ${applicantName},</p>
            <div style="background: #27272a; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #ffffff; margin: 5px 0;"><strong>Job:</strong> ${jobTitle}</p>
              <p style="color: #ffffff; margin: 5px 0;"><strong>Status:</strong> ${status.toUpperCase()}</p>
              <p style="color: #a1a1aa; margin: 10px 0;">${message}</p>
            </div>
            <a href="https://hireai-job-portal.vercel.app/applications" 
               style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 10px;">
              View My Applications
            </a>
          </div>
        </div>
      `,
    });
    console.log("Status update email sent!");
  } catch (err) {
    console.error("Email error:", err);
  }
};