import nodemailer from "nodemailer";
import { appConfig, hasSmtpConfiguration } from "@/lib/config";

export type CustomSolutionsEmailInput = {
  timestamp: string;
  fullName: string;
  emailAddress: string;
  phoneOrWhatsapp: string;
  companyOrOrganization: string;
  solutionType: string;
  requirementsDescription: string;
  preferredTimeline: string;
  approximateBudget: string;
  supportingFileInformation: string;
  sourcePage: string;
  attachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
};

function buildRecipientBody(input: CustomSolutionsEmailInput) {
  return [
    `Submission timestamp: ${input.timestamp}`,
    `Full name: ${input.fullName}`,
    `Email address: ${input.emailAddress}`,
    `Phone or WhatsApp number: ${input.phoneOrWhatsapp}`,
    `Company or organization: ${input.companyOrOrganization || "Not provided"}`,
    `Type of solution required: ${input.solutionType}`,
    "Requirements description:",
    input.requirementsDescription,
    `Preferred timeline: ${input.preferredTimeline}`,
    `Approximate budget: ${input.approximateBudget || "Not provided"}`,
    `Supporting-file information: ${input.supportingFileInformation}`,
    `Source page: ${input.sourcePage}`,
  ].join("\n\n");
}

export async function sendCustomSolutionsEmails(
  input: CustomSolutionsEmailInput,
) {
  if (!hasSmtpConfiguration()) {
    throw new Error("SMTP configuration is missing.");
  }

  const transporter = nodemailer.createTransport({
    host: appConfig.smtpHost,
    port: Number(appConfig.smtpPort),
    secure: Number(appConfig.smtpPort) === 465,
    auth: {
      user: appConfig.smtpUser,
      pass: appConfig.smtpPass,
    },
  });

  const attachments = input.attachment
    ? [
        {
          filename: input.attachment.filename,
          content: input.attachment.content,
          contentType: input.attachment.contentType,
        },
      ]
    : [];

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: appConfig.customSolutionsRecipientEmail,
    subject: `New Custom Solutions Enquiry — ${input.fullName}`,
    text: buildRecipientBody(input),
    attachments,
  });

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: input.emailAddress,
    subject: "We Received Your Requirements — Vyntegra",
    text:
      "Thank you for sharing your requirements with Vyntegra. Our team will review your enquiry and respond within 24 hours with the next steps and a quotation.",
  });
}
