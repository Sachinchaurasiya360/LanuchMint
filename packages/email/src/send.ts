import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { FROM_DEFAULT, getResend } from "./client.js";

export interface SendArgs {
  to: string | string[];
  subject: string;
  template: ReactElement;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(args: SendArgs): Promise<{ id: string }> {
  const html = await render(args.template);
  const text = await render(args.template, { plainText: true });

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: args.from ?? FROM_DEFAULT,
    to: args.to,
    subject: args.subject,
    html,
    text,
    replyTo: args.replyTo,
    tags: args.tags,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
  return { id: data?.id ?? "" };
}
