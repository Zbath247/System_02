import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter: 300 requests per 15 minutes.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
    messageKh: 'សំណើច្រើនពេកពីអាសយដ្ឋាន IP នេះ។ សូមព្យាយាមម្តងទៀតបន្ទាប់ពី ១៥ នាទី។',
  },
});

/**
 * Strict rate limiter for account identification and login attempts:
 * Max 5 failed attempts per 15 minutes to prevent brute-force enumeration.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many identification attempts. Please wait 15 minutes before trying again.',
    messageKh: 'ការប៉ុនប៉ងផ្ទៀងផ្ទាត់ច្រើនពេក។ សូមរង់ចាំ ១៥ នាទីមុនពេលព្យាយាមម្តងទៀត។',
  },
});
