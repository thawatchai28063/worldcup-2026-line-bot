function createTriggers() {
  try {
    deleteTriggers();

    ScriptApp.newTrigger('scheduledSync')
      .timeBased()
      .everyHours(1)
      .create();

    ScriptApp.newTrigger('scheduledDailySummary')
      .timeBased()
      .atHour(8)
      .everyDays(1)
      .inTimezone(getConfiguredTimeZone_())
      .create();

    writeLog('INFO', 'Created triggers', {});
  } catch (error) {
    writeLog('ERROR', 'createTriggers failed', serializeError(error));
    throw error;
  }
}

function deleteTriggers() {
  try {
    ScriptApp.getProjectTriggers().forEach(function(trigger) {
      var handler = trigger.getHandlerFunction();
      if (handler === 'scheduledSync' || handler === 'scheduledDailySummary') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    writeLog('INFO', 'Deleted bot triggers', {});
  } catch (error) {
    writeLog('ERROR', 'deleteTriggers failed', serializeError(error));
    throw error;
  }
}

function scheduledSync() {
  try {
    if (isMockMode()) {
      saveMatches(getMockTodayMatches().concat(getMockTomorrowMatches(), getMockResults()));
      saveStandings(getMockStandings());
      writeLog('INFO', 'scheduledSync saved mock data', {});
      return;
    }

    syncMatchesToSheet();
    syncStandingsToSheet();
  } catch (error) {
    writeLog('ERROR', 'scheduledSync failed', serializeError(error));
  }
}

function scheduledDailySummary() {
  try {
    var matches = fetchTodayMatches();
    pushMessage(null, [createTodayMatchesFlex(matches)]);
    writeLog('INFO', 'scheduledDailySummary pushed', { count: matches.length });
  } catch (error) {
    writeLog('ERROR', 'scheduledDailySummary failed', serializeError(error));
  }
}
