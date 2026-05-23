export function buildRecoveryEmailHtml(otp: string): string;
export function createRecoveryTransporter(): import('nodemailer').Transporter;
export function sendRecoveryEmail(recipient_email: string, otp: string): Promise<void>;
