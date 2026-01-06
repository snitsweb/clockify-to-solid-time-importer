const axios = require('axios');

const CLOCKIFY_REPORT_BASE_URL = 'https://reports.api.clockify.me/v1';

async function fetchTimeEntriesByProject(
  apiKey,
  workspaceId,
  projectId,
  startDate = null,
  endDate = null
) {
  try {
    const reportPayload = {
      dateRangeStart: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      dateRangeEnd: endDate || new Date().toISOString(),
      projects: {
        ids: [projectId],
      },
      detailedFilter: {
        page: 1,
        pageSize: 1000,
      },
    };

    const response = await axios.post(
      `${CLOCKIFY_REPORT_BASE_URL}/workspaces/${workspaceId}/reports/detailed`,
      reportPayload,
      {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.timeentries || [];
  } catch (error) {
    if (error.response) {
      const errorDetails = error.response.data
        ? JSON.stringify(error.response.data)
        : error.response.statusText;
      console.error('Clockify API error details:', errorDetails);
      throw new Error(
        `Clockify API error: ${error.response.status} - ${error.response.statusText} - ${errorDetails}`
      );
    } else if (error.request) {
      throw new Error('No response from Clockify API');
    } else {
      throw new Error(`Error fetching time entries: ${error.message}`);
    }
  }
}

module.exports = {
  fetchTimeEntriesByProject,
};

