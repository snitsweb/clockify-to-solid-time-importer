# Clockify to Solid Time Import

A Bun script that automatically imports time entries from a specific Clockify project to Solid Time. Runs daily via GitHub Actions.

## Features

- Fetches time entries from Clockify for the previous day
- Transforms data to match Solid Time format
- Imports time entries to Solid Time via API
- Runs automatically daily at 00:00 UTC via GitHub Actions

## Prerequisites

- Bun (latest version)
- GitHub repository with Actions enabled
- Clockify API credentials
- Solid Time API credentials

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure GitHub Secret

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add a single secret:

- `SCRIPT_ENVS` - The entire contents of your `.env` file (all environment variables)

Example content for `SCRIPT_ENVS`:
```
CLOCKIFY_API_KEY=your_clockify_api_key_here
CLOCKIFY_WORKSPACE_ID=your_workspace_id_here
CLOCKIFY_PROJECT_ID=your_project_id_here
SOLIDTIME_API_KEY=your_solidtime_api_key_here
SOLIDTIME_API_URL=https://time.sley.dev
SOLIDTIME_ORGANIZATION_ID=your_organization_id_here
SOLIDTIME_MEMBER_ID=your_member_id_here
SOLIDTIME_PROJECT_ID=your_project_id_here
```

### 3. Local Development (Optional)

Create a `.env` file in the root directory for local testing:

```env
CLOCKIFY_API_KEY=your_clockify_api_key_here
CLOCKIFY_WORKSPACE_ID=your_workspace_id_here
CLOCKIFY_PROJECT_ID=your_project_id_here
SOLIDTIME_API_KEY=your_solidtime_api_key_here
SOLIDTIME_API_URL=https://time.sley.dev
SOLIDTIME_ORGANIZATION_ID=your_organization_id_here
SOLIDTIME_MEMBER_ID=your_member_id_here
SOLIDTIME_PROJECT_ID=your_project_id_here
```

Run locally:
```bash
bun run start
```

## How It Works

1. **GitHub Actions Workflow**: The workflow runs daily at 00:00 UTC (configured in `.github/workflows/daily-import.yml`)
2. **Date Range**: Automatically calculates the previous day's date range (00:00:00 to 23:59:59 UTC)
3. **Clockify API**: Fetches time entries from Clockify Reports API filtered by project and date
4. **Data Transformation**: Converts Clockify time entry format to Solid Time format
5. **Solid Time API**: Creates time entries in Solid Time via POST request

## Getting Your Credentials

### Clockify

1. **API Key**: Settings → API → Generate API key
2. **Workspace ID**: Found in URL: `https://app.clockify.me/workspaces/{WORKSPACE_ID}/...`
3. **Project ID**: Found in project URL or via API: `GET /workspaces/{workspaceId}/projects`

### Solid Time

1. **API Key**: Profile Settings → Create API Token
2. **Organization ID**: Found in organization URL or via API: `GET /api/v1/organizations/{organizationId}`
3. **Member ID**: Your user ID or membership ID in the organization
4. **Project ID**: Found in project settings or URL

## GitHub Actions

The workflow (`.github/workflows/daily-import.yml`) will:
- Run daily at 00:00 UTC
- Can also be triggered manually via "Run workflow" button
- Creates `.env` file from repository secrets
- Runs the import script
- Exits with code 0 on success, 1 on error

## Manual Execution

You can also run the script manually:

```bash
bun run start
```

Or trigger the GitHub Actions workflow manually:
1. Go to Actions tab in your repository
2. Select "Daily Import" workflow
3. Click "Run workflow"

## Error Handling

- Validates all required environment variables on startup
- Logs errors with timestamps
- Exits with appropriate exit codes (0 for success, 1 for error)
- GitHub Actions will show workflow failure if import fails

## License

ISC
