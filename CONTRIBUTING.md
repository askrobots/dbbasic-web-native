# Contributing to Semantic Components

Thank you for your interest in contributing! This project is building the future of web interfaces.

## Philosophy

Before contributing, understand our core principles:

1. **Intent over Implementation** - Focus on WHAT users want to do, not HOW to render it
2. **Context-aware by Default** - Components should adapt automatically, not require configuration
3. **Modality-agnostic** - Work across mouse, touch, voice, keyboard, AR without extra code
4. **Future-proof** - Versioned semantics that never break
5. **Accessibility Automatic** - ARIA, keyboard nav, screen readers built-in

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/semantic-components`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build distribution files
npm run build

# Open test page
open http://localhost:8080/complete-demo.html
```

## Project Structure

```
semantic-components/
├── semantic-components.js    # Core component library
├── voice-system.js          # Voice command system
├── context-detection.js     # Environment detection
├── devtools.js             # Developer tools
├── docs/                   # Documentation website
├── dist/                   # Built distribution files
└── tests/                  # Test suite
```

## Adding a New Component

All components should:

1. **Extend SemanticComponent base class**
2. **Implement intent-based API** (not implementation-specific)
3. **Support all modalities** (mouse, touch, voice, keyboard)
4. **Include accessibility** (ARIA roles, keyboard nav)
5. **Respect attention budget** (implement computeAttentionScore)
6. **Be context-aware** (adapt to environment/user state)

### Example Component Structure

```javascript
class SemanticNewComponent extends SemanticComponent {
    static get observedAttributes() {
        return ['intent', 'urgency'];
    }

    render() {
        // Shadow DOM template with styles
        this.shadowRoot.innerHTML = `
            <style>
                /* Component styles */
            </style>
            <div class="component" part="component">
                <slot></slot>
            </div>
        `;
    }

    setupEventListeners() {
        // ACTIVATE intent
        this.addEventListener('click', () => {
            this.emitIntent('activate');
        });

        // INSPECT intent (long-press)
        // Touch, keyboard, voice support
    }

    computeAttentionScore(context) {
        // Calculate priority based on urgency and context
        return score;
    }
}

customElements.define('semantic-new-component', SemanticNewComponent);
```

## Testing

Currently, we test manually using:
- `complete-demo.html` - Full integration test
- Developer tools (Ctrl+Shift+D) - Real-time monitoring
- Multiple browsers and devices
- Voice commands (Ctrl+Shift+V)

Automated tests coming in v1.1.

## Code Style

- Use modern JavaScript (ES6+)
- No external dependencies (keep it lightweight)
- Clear, descriptive variable names
- Comments for complex logic
- Shadow DOM for encapsulation

## Pull Request Guidelines

1. **Description:** Clearly explain what and why
2. **Testing:** Describe how you tested (browsers, devices, modalities)
3. **Breaking Changes:** Mark any breaking changes (should be rare)
4. **Documentation:** Update README.md if adding features
5. **Examples:** Add example usage to docs/

### PR Template

```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed?

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested on mobile
- [ ] Tested with voice commands
- [ ] Tested with keyboard navigation
- [ ] Tested with screen reader

## Screenshots/Demo
If applicable, add screenshots or video

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] No breaking changes (or clearly marked)
- [ ] Accessibility maintained
```

## Feature Requests

Open an issue with:
- **Use case:** What problem does this solve?
- **API proposal:** How would developers use it?
- **Intent-focus:** Does it focus on intent, not implementation?

## Bug Reports

Include:
- **Browser/Device:** What environment?
- **Steps to reproduce:** Clear steps
- **Expected behavior:** What should happen?
- **Actual behavior:** What actually happens?
- **DevTools log:** Screenshot of DevTools (Ctrl+Shift+D)

## Semantic Principles

When contributing, always ask:

### ❌ Wrong Mindset
- "How do I style this button?"
- "What CSS class should this have?"
- "Should this be a div or a span?"

### ✅ Right Mindset
- "What does the user want to DO?"
- "What intent does this represent?"
- "How does context affect this interaction?"

## Areas We Need Help

1. **Gesture Recognition** - Touch patterns, swipe detection
2. **ML Attention Scoring** - Better priority algorithms
3. **AR/Spatial Support** - 3D interaction patterns
4. **Test Suite** - Automated testing framework
5. **More Components** - Tabs, accordions, data tables, etc.
6. **TypeScript Definitions** - Full type safety
7. **Framework Integrations** - React, Vue, Angular wrappers
8. **Documentation** - Examples, tutorials, best practices

## Community

- **Discussions:** Use GitHub Discussions for questions
- **Issues:** For bugs and feature requests
- **Discord:** Coming soon for real-time chat

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Invited to project decisions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Let's build the future of web interfaces together.**

This is what the web should have been.
