import nodemailer, { Transporter } from "nodemailer";
import { injectable } from "tsyringe";
import { IEmailService } from "../../application/service_interface/email.service.interface";
import { config } from "../../shared/config";

@injectable()
export class NodemailerEmailService implements IEmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.USER,
        pass: config.email.PASSWORD,
      },
    });
  }
  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: `"ProTIme" <${config.email.FROM}>`,
      to,
      subject,
      html,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (error) {
      throw new Error(`failed to send email: ${(error as Error).message}`);
    }
  }
}
