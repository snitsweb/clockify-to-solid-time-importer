function transformClockifyToSolidTime(clockifyEntries) {
  return clockifyEntries.map((entry) => {
    let tags = '';
    if (entry.tags && Array.isArray(entry.tags)) {
      tags = entry.tags.map((tag) => tag.name || tag).join(',');
    } else if (entry.tagIds && Array.isArray(entry.tagIds)) {
      tags = entry.tagIds.join(',');
    }

    const startDate = entry.timeInterval?.start
      ? new Date(entry.timeInterval.start).toISOString()
      : '';
    const endDate = entry.timeInterval?.end
      ? new Date(entry.timeInterval.end).toISOString()
      : '';

    return {
      description: entry.description || '',
      billable: entry.billable ? 'true' : 'false',
      client: entry.clientName || '',
      project: entry.projectName || '',
      tags: tags,
      start: startDate,
      end: endDate,
      task: entry.taskName || '',
      user_name: entry.userName || '',
      user_email: entry.userEmail || '',
    };
  });
}

module.exports = {
  transformClockifyToSolidTime,
};

