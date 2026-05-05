# Security Guidelines

## Environment Variables

This project requires sensitive environment variables for database connections and authentication. **Never commit these files to version control.**

### Files to Keep Private
- `.env` - Backend environment variables
- `env.yaml` - Environment configuration with MongoDB Atlas credentials
- Any other files containing secrets

### Setting Up Local Environment

1. **Backend Setup:**
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your MongoDB URI and JWT secret

2. **Root Level Setup:**
   - Copy `env.yaml.example` to `env.yaml`
   - Add your MongoDB Atlas connection string

### MongoDB Atlas Security

For MongoDB Atlas connections:
- Use IP address whitelist to restrict access
- Create a dedicated database user with minimal permissions
- Regularly rotate credentials
- Never commit connection strings to git
- Use environment variables for all sensitive data

### GitHub Security

If you accidentally push credentials:
1. Rotate the credentials immediately in MongoDB Atlas
2. Use `git filter-branch` to remove from history
3. Force push to update the remote repository

### Best Practices

- Use `.gitignore` to exclude sensitive files
- Use `.env.example` files as templates for required variables
- Never hardcode secrets in source code
- Use GitHub Secrets for CI/CD pipelines
- Review `.gitignore` before each commit
