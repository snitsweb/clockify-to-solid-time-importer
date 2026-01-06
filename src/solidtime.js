const axios = require('axios');

async function importToSolidTime(apiKey, apiUrl, organizationId, memberId, projectId, transformedEntries) {
  if (!apiKey || !apiUrl || !organizationId || !memberId || !projectId) {
    throw new Error('SOLIDTIME_API_KEY, SOLIDTIME_API_URL, SOLIDTIME_ORGANIZATION_ID, SOLIDTIME_MEMBER_ID, and SOLIDTIME_PROJECT_ID are required');
  }

  const baseUrl = apiUrl.replace(/\/$/, '');
  const entries = Array.isArray(transformedEntries) ? transformedEntries : [transformedEntries];
  const endpoint = `${baseUrl}/api/v1/organizations/${organizationId}/time-entries`;

  try {
    const results = [];
    
    for (const entry of entries) {
      const tags = entry.tags ? entry.tags.split(',').filter(t => t.trim()).map(t => t.trim()) : [];
      
      const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
      };
      
      const payload = {
        member_id: memberId,
        project_id: projectId,
        task_id: null,
        start: formatDate(entry.start),
        end: formatDate(entry.end),
        billable: entry.billable === 'true',
        description: entry.description || null,
        tags: tags,
      };

      const response = await axios.post(
        endpoint,
        payload,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      results.push(response.data);
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.statusText;
      const errorDetails = error.response.data
        ? JSON.stringify(error.response.data)
        : error.response.statusText;
      throw new Error(
        `Solid Time API error: ${error.response.status} - ${errorMessage} - ${errorDetails}`
      );
    } else if (error.request) {
      throw new Error('No response from Solid Time API');
    } else {
      throw new Error(`Error importing to Solid Time: ${error.message}`);
    }
  }
}

module.exports = {
  importToSolidTime,
};
