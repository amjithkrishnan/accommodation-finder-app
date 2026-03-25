const InputSanitizer = {

    // Strip HTML tags and dangerous characters
    sanitize(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/<[^>]*>/g, '')
            .replace(/[<>"'%;()&+]/g, '')
            .trim();
    },

    sanitizeEmail(value) {
        const cleaned = this.sanitize(value).toLowerCase();
        if (cleaned.length > 254) return '';
        return cleaned;
    },

    sanitizeNumber(value) {
        const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
        return isNaN(num) ? '' : num;
    },

    sanitizeForm(form) {
        const result = {};
        for (const [key, value] of Object.entries(form)) {
            if (Array.isArray(value)) {
                result[key] = value.map(v => typeof v === 'string' ? this.sanitize(v) : v);
            } else if (key === 'email') {
                result[key] = this.sanitizeEmail(value);
            } else if (key === 'price' || key === 'bedrooms' || key === 'bathrooms') {
                result[key] = value;
            } else if (typeof value === 'string') {
                result[key] = this.sanitize(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validatePassword(password) {
        return password && password.length >= 6;
    }
};
