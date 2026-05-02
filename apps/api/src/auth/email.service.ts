import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'Nexus Genesis <onboarding@resend.dev>');
  }

  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured. Email was not sent.');
      return false;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: 'Código de Recuperación - Nexus Genesis',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded-xl: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a56db; margin: 0;">Nexus Genesis</h1>
              <p style="color: #666; font-size: 14px;">ERP de Élite</p>
            </div>
            <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; text-align: center;">
              <h2 style="color: #111827; margin-top: 0;">Tu código de seguridad</h2>
              <p style="color: #4b5563; font-size: 16px;">Has solicitado restablecer tu contraseña. Utiliza el siguiente código para completar el proceso:</p>
              <div style="display: inline-block; padding: 15px 30px; background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 32px; font-weight: bold; color: #111827; letter-spacing: 5px; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">Este código expirará en 10 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
              <p>&copy; 2024 Nexus Genesis. Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`Recovery email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending recovery email: ${error.message}`);
      return false;
    }
  }
}
