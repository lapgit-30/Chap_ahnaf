export async function sendOtpSms(mobile: string, code: string): Promise<void> {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  const template = process.env.KAVENEGAR_OTP_TEMPLATE || "verify";

  if (!apiKey) {
    if (process.env.OTP_DEBUG === "true" && process.env.NODE_ENV !== "production") {
      console.info(`[OTP_DEBUG] ${mobile}: ${code}`);
      return;
    }
    throw new Error("سرویس پیامک پیکربندی نشده است");
  }

  const endpoint = `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/verify/lookup.json`;
  const body = new URLSearchParams({
    receptor: mobile,
    token: code,
    template,
    type: "sms",
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  const data = (await response.json()) as {
    return?: { status?: number; message?: string };
  };
  if (!response.ok || data.return?.status !== 200) {
    throw new Error(data.return?.message || "ارسال پیامک ناموفق بود");
  }
}
