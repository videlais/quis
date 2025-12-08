---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: 'bug'
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Expression used: `...`
2. Values function: `...`
3. Expected result: `...`
4. Actual result: `...`

**Code Example**
```javascript
// Provide a minimal code example that reproduces the issue
import { parse } from 'quis';

const values = (name) => {
    // Your values function
};

const result = parse('your expression here', { values });
console.log(result); // What you got vs what you expected
```

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment (please complete the following information):**
- Quis version: [e.g. 1.3.6]
- Node.js version: [e.g. 20.10.0]
- Browser (if applicable): [e.g. Chrome 120, Firefox 121]
- OS: [e.g. macOS 14.0, Windows 11, Ubuntu 22.04]

**Error Messages**
If applicable, include any error messages or stack traces:

```
Paste error message here
```

**Additional context**
Add any other context about the problem here.

**Checklist**
- [ ] I have searched existing issues to ensure this is not a duplicate
- [ ] I have provided a minimal code example that reproduces the issue
- [ ] I have included the Quis version and environment information
- [ ] I have checked that this issue occurs with the latest version of Quis