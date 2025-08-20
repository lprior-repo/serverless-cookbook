# 📚 Serverless Terraform Cookbook Documentation

Beautiful, Stripe-like documentation for your Terraform patterns, built with MkDocs Material.

## 🚀 Quick Start

### View the Documentation Locally

```bash
# Start the development server
npm run docs:serve
```

Then open [http://127.0.0.1:8000/serverless-cookbook/](http://127.0.0.1:8000/serverless-cookbook/) in your browser.

### Full Development Workflow

```bash
# Generate docs from JSON data and start server
npm run docs:dev
```

This will:
1. Build the TypeScript project
2. Generate markdown files from `terraform-aws-services.json`
3. Start the MkDocs development server

## 📖 Available Commands

| Command | Description |
|---------|-------------|
| `npm run docs:generate` | Generate markdown files from JSON data |
| `npm run docs:serve` | Start MkDocs development server |
| `npm run docs:build` | Build static site for production |
| `npm run docs:dev` | Full pipeline: generate + serve |

## 🎨 What You Get

- **Beautiful Material Design**: Modern, responsive documentation
- **Code Syntax Highlighting**: Terraform code with proper highlighting
- **Pattern Categories**: Organized by compute, integration, storage, security
- **Difficulty Levels**: Beginner, intermediate, advanced indicators
- **Rich Markdown**: Admonitions, tabs, tables, and more
- **Search**: Full-text search across all patterns
- **Mobile Friendly**: Responsive design for all devices

## 📁 Generated Structure

```
docs/
├── index.md                 # Homepage
├── getting-started/
│   └── index.md            # Getting started guide
├── patterns/
│   ├── index.md            # Pattern overview
│   ├── compute/            # Lambda patterns
│   ├── integration/        # EventBridge, SNS, etc.
│   ├── storage/            # S3, DynamoDB, etc.
│   └── security/           # Secrets, config patterns
├── templates/
│   └── index.md            # Project templates
└── contributing/
    └── index.md            # Contribution guide
```

## 🎯 Pattern Format

Each pattern includes:

- **Frontmatter**: Title, description, tags
- **At a Glance**: Difficulty, services, use case
- **When to Use**: Clear guidance on applicability  
- **Architecture**: Overview of the pattern
- **Implementation**: Full Terraform code with tabs
- **Next Steps**: Related patterns and resources

## 🛠 Customization

### Themes & Styling

Edit `docs/stylesheets/extra.css` to customize:
- Colors and branding
- Pattern card layouts
- Code block styling
- Difficulty badges

### Configuration

Edit `mkdocs.yml` to modify:
- Site navigation
- Theme settings
- Markdown extensions
- Plugin configuration

### Content Generation

Modify `src/docs-generator.ts` to change:
- Pattern formatting
- Metadata extraction
- Category organization
- Difficulty calculation

## 🔧 Technical Details

- **Generator**: TypeScript with Effect.ts for functional programming
- **Theme**: Material for MkDocs with custom styling
- **Source**: Real Terraform code from terraform-aws-modules
- **Build**: Fully automated from JSON to beautiful docs

## 🌟 Next Steps

1. **Customize Branding**: Update colors, logos, and styling
2. **Add More Patterns**: Extend the JSON scraper for more repositories
3. **Deploy**: Use GitHub Pages, Netlify, or your preferred hosting
4. **Integrate**: Connect with your existing documentation workflow

---

*Your serverless Terraform patterns never looked so good! 🚀*