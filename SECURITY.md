# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.3.x   | :white_check_mark: |
| < 1.3   | :x:                |

## Reporting a Vulnerability

The Quis team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to https://github.com/videlais/quis/security/advisories
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email**
   - Send details to the repository maintainer
   - Include "SECURITY" in the subject line

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity and complexity

We will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible

### Disclosure Policy

- We request that you give us reasonable time to address the issue before public disclosure
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We will publish a security advisory when the fix is released

## Security Best Practices

When using Quis:

### Input Validation

Always validate and sanitize user input before passing it to the parser:

```javascript
// ❌ Dangerous - untrusted user input
const userInput = req.body.filter;
parse(userInput, { values });

// ✅ Better - validate input first
function isValidExpression(input) {
    if (typeof input !== 'string') return false;
    if (input.length > 1000) return false; // Reasonable length limit
    return true;
}

if (isValidExpression(userInput)) {
    parse(userInput, { values });
}
```

### Values Callback Security

Ensure your values callback doesn't expose sensitive data:

```javascript
// ❌ Dangerous - exposes all object properties
const values = (name) => userData[name];

// ✅ Better - whitelist allowed properties
const allowedFields = ['name', 'age', 'level'];
const values = (name) => {
    if (allowedFields.includes(name)) {
        return userData[name];
    }
    return null;
};
```

### Custom Conditions

Validate custom condition implementations:

```javascript
// ❌ Dangerous - arbitrary code execution risk
addCustomCondition('eval', (value, code) => eval(code));

// ✅ Safe - controlled logic only
addCustomCondition('inRange', (value, range) => {
    const [min, max] = range.split('-').map(Number);
    return value >= min && value <= max;
});
```

### Rate Limiting

Implement rate limiting for parsing operations in web applications to prevent DoS attacks.

## Known Issues

There are currently no known security vulnerabilities in the latest version.

## Comments on This Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue.

## Attribution

This security policy is adapted from industry best practices and open source security guidelines.
