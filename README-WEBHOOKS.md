Webhook signature verification (Paystack)

To enable strict webhook signature verification in production:

1. Set `PAYSTACK_SECRET_KEY` in your production environment to your Paystack secret.
2. Ensure your `ADMIN_PAYMENT_WEBHOOK_URL` (if used) and Paystack dashboard webhooks use the exact URL for the hosted `/api/paystack/webhook` endpoint.
3. In production, the code will automatically validate the `x-paystack-signature` header. If the signature is invalid the webhook will return 401.

Testing locally:
- Paystack provides a test webhook simulator in their dashboard. It will include the signature header when you configure the webhook with the same secret.
- If you cannot run Paystack's simulator, you can forward webhooks via a tunnel (ngrok) and set the same secret in your local env. Make sure `PAYSTACK_SECRET_KEY` is set locally when testing.

If you need to bypass verification in development, you can temporarily set `NODE_ENV=development` or unset `PAYSTACK_SECRET_KEY`, but this is not recommended for production.
