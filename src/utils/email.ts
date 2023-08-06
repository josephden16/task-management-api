import { createTransport } from "nodemailer";
import handlebars from "handlebars";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import UAParser from "ua-parser-js";
import geoip from "geoip-lite";

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

export function getLoginNotifactionInfo(
  name: string,
  req: { headers: any; ip: string }
): any {
  const useragent = req.headers["user-agent"] || "";
  const parser = new UAParser(useragent);
  const result = parser.getResult();
  const loginDate = new Date().toLocaleDateString();
  const loginTime = new Date().toLocaleTimeString();
  const ip = req.ip;
  const geo = geoip.lookup(ip);
  return {
    name: name,
    loginDate: loginDate,
    loginTime: loginTime,
    ipAddress: ip,
    city: geo?.city,
    country: geo?.country,
    browser: result.browser.name,
    broswerVersion: result.browser.version,
    os: result.os.name,
    osVersion: result.os.version,
    device:
      Object.keys(result.device).length === 0
        ? `${result.device.vendor} ${result.device.model} ${result.device.type}`
        : null,
  };
}
