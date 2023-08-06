import { createTransport } from "nodemailer";
import handlebars from "handlebars";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const sendEmail = async (
  email: string,
  subject: string,
  payload: any,
  template: string
) => {
  try {
    const transporter = createTransport({
      host: process.env.MAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const source = readFileSync(join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    await transporter.sendMail(options());
  } catch (error) {
    throw new Error("Failed to send email");
  }
};
