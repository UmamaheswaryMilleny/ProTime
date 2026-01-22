import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { injectable } from "tsyringe";

import type { IEmailService } from "../../domain/service-interfaces/email-service-interface.js";
import { config } from "../../shared/config.js";
import { EVENT_EMMITER_TYPE } from "../../shared/constants/constants.js";
import { eventBus } from "../../shared/eventBus.js";

@injectable()
export class EmailService implements IEmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.EMAIL,
        pass: config.email.PASSWORD,
      },
    });

    this.registerEventListener();
  }

  private registerEventListener(): void {
    eventBus.on(EVENT_EMMITER_TYPE.SENDMAIL, this.sendMail.bind(this));
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: `"ProTIme" <${config.email.EMAIL}>`,
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  }
}