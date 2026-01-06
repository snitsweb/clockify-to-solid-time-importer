require('dotenv').config();
const clockify = require('./src/clockify');
const solidtime = require('./src/solidtime');
const transform = require('./src/transform');

function validateEnvironment() {
  const required = [
    'CLOCKIFY_API_KEY',
    'CLOCKIFY_WORKSPACE_ID',
    'CLOCKIFY_PROJECT_ID',
    'SOLIDTIME_API_KEY',
    'SOLIDTIME_API_URL',
    'SOLIDTIME_ORGANIZATION_ID',
    'SOLIDTIME_MEMBER_ID',
    'SOLIDTIME_PROJECT_ID',
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

function getPreviousDayDateRange() {
  const now = new Date();
  const previousDay = new Date(now);
  previousDay.setUTCDate(now.getUTCDate() - 1);
  previousDay.setUTCHours(0, 0, 0, 0);

  const endOfPreviousDay = new Date(previousDay);
  endOfPreviousDay.setUTCHours(23, 59, 59, 0);

  const startISO = previousDay.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const endISO = endOfPreviousDay.toISOString().replace(/\.\d{3}Z$/, 'Z');

  return {
    start: startISO,
    end: endISO,
  };
}

async function runImport() {
  try {
    validateEnvironment();

    const projectId = process.env.CLOCKIFY_PROJECT_ID;
    const clockifyApiKey = process.env.CLOCKIFY_API_KEY;
    const workspaceId = process.env.CLOCKIFY_WORKSPACE_ID;

    const dateRange = getPreviousDayDateRange();
    const previousDayStr = dateRange.start.split('T')[0];

    console.log(
      `[${new Date().toISOString()}] Starting import for project: ${projectId}`
    );
    console.log(
      `[${new Date().toISOString()}] Importing entries from: ${previousDayStr}`
    );

    const clockifyEntries = await clockify.fetchTimeEntriesByProject(
      clockifyApiKey,
      workspaceId,
      projectId,
      dateRange.start,
      dateRange.end
    );

    console.log(
      `[${new Date().toISOString()}] Found ${clockifyEntries.length} time entries`
    );

    if (clockifyEntries.length === 0) {
      console.log(
        `[${new Date().toISOString()}] No time entries found for project ${projectId} on ${previousDayStr}`
      );
      process.exit(0);
    }

    const transformedEntries = transform.transformClockifyToSolidTime(
      clockifyEntries
    );

    console.log(`[${new Date().toISOString()}] Importing to Solid Time...`);

    const solidtimeApiKey = process.env.SOLIDTIME_API_KEY;
    const solidtimeApiUrl = process.env.SOLIDTIME_API_URL;
    const solidtimeOrganizationId = process.env.SOLIDTIME_ORGANIZATION_ID;
    const solidtimeMemberId = process.env.SOLIDTIME_MEMBER_ID;
    const solidtimeProjectId = process.env.SOLIDTIME_PROJECT_ID;

    await solidtime.importToSolidTime(
      solidtimeApiKey,
      solidtimeApiUrl,
      solidtimeOrganizationId,
      solidtimeMemberId,
      solidtimeProjectId,
      transformedEntries
    );

    console.log(
      `[${new Date().toISOString()}] Import completed successfully. ${transformedEntries.length} entries imported to Solid Time.`
    );
    process.exit(0);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Import error:`, error.message);
    process.exit(1);
  }
}

runImport();

