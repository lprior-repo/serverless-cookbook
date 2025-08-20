# Backstage TechDocs Compatibility Guide

This document outlines how the Serverless Terraform Cookbook's MkDocs-based documentation is compatible with [Backstage TechDocs](https://backstage.io/docs/features/techdocs/techdocs-overview).

## Overview

**Yes, this documentation is fully compatible with Backstage TechDocs!** 

Backstage TechDocs uses MkDocs under the hood, and our documentation follows all the standard MkDocs conventions that TechDocs expects.

## Compatibility Details

### ✅ What Works Out of the Box

1. **MkDocs Configuration**: Our `mkdocs.yml` uses standard configuration options that are fully supported by TechDocs
2. **Material Theme**: TechDocs supports the Material for MkDocs theme which we use
3. **Markdown Content**: All our pattern documentation uses standard Markdown syntax
4. **Code Blocks**: Our Terraform code blocks with syntax highlighting work perfectly in TechDocs
5. **Navigation Structure**: Our hierarchical navigation (Home → Patterns → Categories → Individual Patterns) maps directly to TechDocs
6. **Tabbed Content**: The implementation tabs (main.tf, variables.tf, outputs.tf, versions.tf) use the standard `pymdownx.tabbed` extension
7. **Admonitions**: Our info/tip/warning boxes use standard Material for MkDocs admonitions

### 📋 Requirements for TechDocs Integration

To integrate with Backstage TechDocs, you'll need:

1. **catalog-info.yaml**: Add this file to your repository root:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: serverless-terraform-cookbook
  description: Production-ready Terraform patterns for AWS serverless architecture
  annotations:
    backstage.io/techdocs-ref: dir:.
spec:
  type: documentation
  lifecycle: production
  owner: platform-team
```

2. **Repository Structure**: Ensure your docs are in the standard location:
   - `mkdocs.yml` in repository root ✅ 
   - `docs/` directory with markdown files ✅
   - Both are already correctly positioned

### 🔧 MkDocs Extensions Used

All extensions we use are TechDocs-compatible:

```yaml
markdown_extensions:
  - pymdownx.highlight      # Code syntax highlighting
  - pymdownx.superfences    # Code blocks and diagrams  
  - pymdownx.tabbed         # Tabbed content sections
  - admonition             # Info/warning/tip boxes
  - pymdownx.emoji         # Icon support
  - toc                    # Table of contents
  - attr_list              # Element attributes
  - md_in_html            # Markdown in HTML blocks
```

### 🎨 Theme and Styling

- **Theme**: `material` - Fully supported by TechDocs
- **Color Scheme**: Both light and dark themes work
- **Icons**: FontAwesome and Material icons render correctly
- **Custom CSS**: Our pattern grid styling is TechDocs-compatible

### 📝 Content Features

1. **Code Tabs**: Our implementation section with tabbed Terraform files works perfectly
2. **At a Glance Tables**: Metadata tables render correctly
3. **GitHub Links**: External source code links function as expected
4. **Pattern Navigation**: Category-based organization integrates seamlessly

## Integration Steps

### 1. Add to Backstage Catalog

```yaml
# In your Backstage catalog
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: serverless-terraform-cookbook
  title: Serverless Terraform Cookbook
  description: Production-ready Terraform patterns for AWS serverless architecture
  tags:
    - terraform
    - aws
    - serverless
    - infrastructure
  annotations:
    backstage.io/techdocs-ref: dir:.
    github.com/project-slug: your-org/serverless-cookbook
spec:
  type: documentation
  lifecycle: production
  owner: platform-team
  system: infrastructure
```

### 2. Configure TechDocs Builder

No special configuration needed - standard TechDocs setup works:

```yaml
# In your Backstage app-config.yaml
techdocs:
  builder: 'local'  # or 'external'
  generator:
    runIn: 'local'  # or 'docker'
  publisher:
    type: 'local'   # or 'googleGcs', 'awsS3', etc.
```

### 3. Verify in Backstage

Once integrated, you'll see:
- Documentation appears in the TechDocs section
- All 24+ patterns are browsable
- Code syntax highlighting works
- Tabbed content functions correctly
- Search works across all patterns
- Links and navigation work as expected

## Benefits in Backstage

1. **Centralized Documentation**: All Terraform patterns in your organization's docs portal
2. **Searchable**: Full-text search across all patterns and code
3. **Version Control**: Automatic updates when patterns change
4. **Team Access**: Integrated with Backstage's auth and permissions
5. **Cross-References**: Can link to related services and components

## Testing Compatibility

You can verify compatibility by:

1. Installing TechDocs CLI: `npm install -g @techdocs/cli`
2. Running: `techdocs-cli serve`
3. Viewing at: `http://localhost:3000`

## Additional Resources

- [Backstage TechDocs Documentation](https://backstage.io/docs/features/techdocs/)
- [MkDocs Material Documentation](https://squidfunk.github.io/mkdocs-material/)
- [TechDocs FAQ](https://backstage.io/docs/features/techdocs/faq)

---

## Summary

✅ **Fully Compatible**: This documentation works perfectly with Backstage TechDocs without any modifications.

The only requirement is adding a `catalog-info.yaml` file to register the component with Backstage. All our MkDocs configuration, extensions, themes, and content are TechDocs-compatible.