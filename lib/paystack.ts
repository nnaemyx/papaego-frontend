/**
 * Dynamically loads Paystack Inline JS script
 */
export const loadPaystackInline = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return resolve(null);
    }
    if ((window as any).PaystackPop) {
      return resolve((window as any).PaystackPop);
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      resolve((window as any).PaystackPop);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Paystack Inline SDK"));
    };
    document.body.appendChild(script);
  });
};
