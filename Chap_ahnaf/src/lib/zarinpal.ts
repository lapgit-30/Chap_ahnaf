type ZarinpalResult = {
  data?: { code?: number; authority?: string; ref_id?: number };
  errors?: { code?: number; message?: string } | unknown[];
};

function config() {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;
  if (!merchantId) throw new Error("درگاه پرداخت پیکربندی نشده است");
  const sandbox = process.env.ZARINPAL_SANDBOX === "true";
  const base = sandbox ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
  return { merchantId, base };
}

async function post(path: string, payload: Record<string, unknown>): Promise<ZarinpalResult> {
  const { base } = config();
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const result = (await response.json()) as ZarinpalResult;
  if (!response.ok) throw new Error("ارتباط با درگاه پرداخت ناموفق بود");
  return result;
}

export async function requestPayment(input: {
  amountToman: number;
  callbackUrl: string;
  description: string;
  mobile: string;
}) {
  const { merchantId, base } = config();
  const result = await post("/pg/v4/payment/request.json", {
    merchant_id: merchantId,
    amount: input.amountToman,
    currency: "IRT",
    callback_url: input.callbackUrl,
    description: input.description,
    metadata: { mobile: input.mobile },
  });
  if (result.data?.code !== 100 || !result.data.authority) {
    throw new Error("ایجاد درخواست پرداخت ناموفق بود");
  }
  return {
    authority: result.data.authority,
    gatewayUrl: `${base}/pg/StartPay/${result.data.authority}`,
  };
}

export async function verifyPayment(authority: string, amountToman: number) {
  const { merchantId } = config();
  const result = await post("/pg/v4/payment/verify.json", {
    merchant_id: merchantId,
    amount: amountToman,
    currency: "IRT",
    authority,
  });
  const code = result.data?.code;
  if (code !== 100 && code !== 101) throw new Error("تراکنش تأیید نشد");
  return { refId: String(result.data?.ref_id || ""), alreadyVerified: code === 101 };
}
