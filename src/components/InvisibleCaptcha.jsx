import { forwardRef, useImperativeHandle, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

/**
 * Wraps hCaptcha's invisible mode behind a simple getToken() promise, so
 * calling code just does `const token = await captchaRef.current.getToken()`
 * before any email/password auth call, instead of juggling callbacks.
 *
 * Drop <InvisibleCaptcha ref={captchaRef} /> anywhere in the tree (it renders
 * nothing visible) and reuse the same ref for every submit in that form.
 */
const InvisibleCaptcha = forwardRef((_props, ref) => {
  const widgetRef = useRef(null);
  const resolveRef = useRef(null);
  const rejectRef = useRef(null);
  const timeoutRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getToken: () =>
      new Promise((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Captcha check timed out — please try again.'));
        }, 15000);
        // reset first so we always get a fresh, single-use token
        widgetRef.current?.resetCaptcha();
        widgetRef.current?.execute();
      }),
  }));

  const settle = (fn, value) => {
    clearTimeout(timeoutRef.current);
    fn?.(value);
  };

  return (
    <HCaptcha
      ref={widgetRef}
      sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
      size="invisible"
      onVerify={(token) => settle(resolveRef.current, token)}
      onError={(err) => settle(rejectRef.current, new Error(`Captcha error: ${err}`))}
      onExpire={() => settle(rejectRef.current, new Error('Captcha expired — please try again.'))}
    />
  );
});

InvisibleCaptcha.displayName = 'InvisibleCaptcha';
export default InvisibleCaptcha;
