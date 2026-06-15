var SHEET_HEADERS = {
  settings: ['key', 'value'],
  matches: [
    'match_id',
    'competition',
    'stage',
    'group_name',
    'home_team',
    'away_team',
    'home_score',
    'away_score',
    'match_time_utc',
    'match_time_th',
    'status',
    'venue',
    'updated_at'
  ],
  standings: [
    'group_name',
    'position',
    'team_name',
    'played',
    'won',
    'draw',
    'lost',
    'goals_for',
    'goals_against',
    'goal_difference',
    'points',
    'updated_at'
  ],
  cache: ['key', 'value', 'updated_at'],
  logs: ['created_at', 'type', 'message', 'data']
};

var DEFAULT_SETTINGS = [
  ['LINE_CHANNEL_ACCESS_TOKEN', ''],
  ['LINE_CHANNEL_SECRET', ''],
  ['FOOTBALL_DATA_API_KEY', ''],
  ['LINE_PUSH_TARGET_ID', ''],
  ['BASE_DASHBOARD_URL', ''],
  ['USE_MOCK_DATA', 'true'],
  ['TIMEZONE', 'Asia/Bangkok']
];

function setupSheets() {
  try {
    Object.keys(SHEET_HEADERS).forEach(function(sheetName) {
      var sheet = getOrCreateSheet_(sheetName);
      ensureHeader_(sheet, SHEET_HEADERS[sheetName]);
      if (sheetName === 'settings' && sheet.getLastRow() < 2) {
        sheet.getRange(2, 1, DEFAULT_SETTINGS.length, 2).setValues(DEFAULT_SETTINGS);
      }
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, SHEET_HEADERS[sheetName].length);
    });
    writeLog('INFO', 'setupSheets completed', {});
  } catch (error) {
    console.error('setupSheets failed', error);
    throw error;
  }
}

function getTodayMatchesFromSheet() {
  return filterMatchesByDate_(new Date());
}

function getTomorrowMatchesFromSheet() {
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return filterMatchesByDate_(tomorrow);
}

function getAllMatchesFromSheet() {
  return readObjects_('matches').sort(function(a, b) {
    return String(a.match_time_utc || a.match_time_th || '').localeCompare(String(b.match_time_utc || b.match_time_th || ''));
  });
}

function getGroupMatchesFromSheet(groupName) {
  var normalizedGroup = String(groupName || '').trim().toUpperCase();
  return getAllMatchesFromSheet().filter(function(match) {
    return String(match.group_name || '').trim().toUpperCase() === normalizedGroup;
  });
}

function getStandingsFromSheet() {
  var rows = readObjects_('standings');
  return rows.reduce(function(groups, row) {
    var groupName = String(row.group_name || '').toUpperCase();
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(normalizeStandingRow_(row));
    return groups;
  }, {});
}

function getGroupStandingFromSheet(groupName) {
  var standings = getStandingsFromSheet();
  return standings[String(groupName || '').toUpperCase()] || [];
}

function getResultsFromSheet() {
  return readObjects_('matches').filter(function(match) {
    var status = String(match.status || '').toUpperCase();
    return status === 'FINISHED' || status === 'FT';
  }).sort(function(a, b) {
    return String(b.match_time_utc || b.match_time_th || '').localeCompare(String(a.match_time_utc || a.match_time_th || ''));
  });
}

function saveMatches(matches) {
  var sheet = getOrCreateSheet_('matches');
  ensureHeader_(sheet, SHEET_HEADERS.matches);
  clearDataRows_(sheet);

  if (!matches || !matches.length) {
    setCacheValue_('matches_count', 0);
    setCacheValue_('matches_last_sync', new Date());
    return;
  }

  var rows = matches.map(function(match) {
    return SHEET_HEADERS.matches.map(function(header) {
      return match[header] !== undefined ? match[header] : '';
    });
  });
  sheet.getRange(2, 1, rows.length, SHEET_HEADERS.matches.length).setValues(rows);
  setCacheValue_('matches_count', matches.length);
  setCacheValue_('matches_last_sync', new Date());
}

function saveStandings(standings) {
  var sheet = getOrCreateSheet_('standings');
  ensureHeader_(sheet, SHEET_HEADERS.standings);
  clearDataRows_(sheet);

  var rows = Array.isArray(standings) ? standings : flattenStandings_(standings);
  if (!rows.length) {
    setCacheValue_('standings_count', 0);
    setCacheValue_('standings_last_sync', new Date());
    return;
  }

  var values = rows.map(function(row) {
    return SHEET_HEADERS.standings.map(function(header) {
      return row[header] !== undefined ? row[header] : '';
    });
  });
  sheet.getRange(2, 1, values.length, SHEET_HEADERS.standings.length).setValues(values);
  setCacheValue_('standings_count', rows.length);
  setCacheValue_('standings_last_sync', new Date());
}

function appendLog(row) {
  var sheet = getOrCreateSheet_('logs');
  ensureHeader_(sheet, SHEET_HEADERS.logs);
  sheet.appendRow(row);
}

function setConfig(key, value) {
  var sheet = getOrCreateSheet_('settings');
  ensureHeader_(sheet, SHEET_HEADERS.settings);
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }

  sheet.appendRow([key, value]);
}

function setCacheValue_(key, value) {
  var sheet = getOrCreateSheet_('cache');
  ensureHeader_(sheet, SHEET_HEADERS.cache);
  var values = sheet.getDataRange().getValues();
  var now = new Date();

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === key) {
      sheet.getRange(i + 1, 2, 1, 2).setValues([[value, now]]);
      return;
    }
  }

  sheet.appendRow([key, value, now]);
}

function getCacheValue_(key) {
  var sheet = getSheetByName_('cache');
  if (!sheet || sheet.getLastRow() < 2) {
    return '';
  }

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === key) {
      return values[i][1];
    }
  }
  return '';
}

function getSheetByName_(sheetName) {
  return getSpreadsheet_().getSheetByName(sheetName);
}

function getOrCreateSheet_(sheetName) {
  var spreadsheet = getSpreadsheet_();
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function getSpreadsheet_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) {
    properties.setProperty('SPREADSHEET_ID', activeSpreadsheet.getId());
    return activeSpreadsheet;
  }

  var createdSpreadsheet = SpreadsheetApp.create('World Cup 2026 Bot Data');
  properties.setProperty('SPREADSHEET_ID', createdSpreadsheet.getId());
  return createdSpreadsheet;
}

function ensureHeader_(sheet, headers) {
  var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var needsHeader = current.join('') === '' || current.join('|') !== headers.join('|');
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function clearDataRows_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
}

function readObjects_(sheetName) {
  var sheet = getSheetByName_(sheetName);
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  return values.slice(1).filter(function(row) {
    return row.join('') !== '';
  }).map(function(row) {
    return headers.reduce(function(object, header, index) {
      object[header] = row[index];
      return object;
    }, {});
  });
}

function filterMatchesByDate_(date) {
  var target = Utilities.formatDate(date, getConfiguredTimeZone_(), 'yyyy-MM-dd');
  return readObjects_('matches').filter(function(match) {
    var dateValue = match.match_time_th || match.match_time_utc;
    if (!dateValue) {
      return false;
    }
    var parsed = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(parsed.getTime())) {
      return String(dateValue).indexOf(target) === 0;
    }
    return Utilities.formatDate(parsed, getConfiguredTimeZone_(), 'yyyy-MM-dd') === target;
  });
}

function normalizeStandingRow_(row) {
  return {
    group_name: row.group_name,
    position: Number(row.position || 0),
    team_name: row.team_name,
    played: Number(row.played || 0),
    won: Number(row.won || 0),
    draw: Number(row.draw || 0),
    lost: Number(row.lost || 0),
    goals_for: Number(row.goals_for || 0),
    goals_against: Number(row.goals_against || 0),
    goal_difference: Number(row.goal_difference || 0),
    points: Number(row.points || 0)
  };
}

function flattenStandings_(standings) {
  var rows = [];
  Object.keys(standings || {}).forEach(function(groupName) {
    (standings[groupName] || []).forEach(function(team) {
      rows.push({
        group_name: groupName,
        position: team.position,
        team_name: team.team_name,
        played: team.played,
        won: team.won,
        draw: team.draw,
        lost: team.lost,
        goals_for: team.goals_for,
        goals_against: team.goals_against,
        goal_difference: team.goal_difference,
        points: team.points,
        updated_at: new Date()
      });
    });
  });
  return rows;
}

function getConfiguredTimeZone_() {
  return getConfig('TIMEZONE') || 'Asia/Bangkok';
}
