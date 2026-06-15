var FOOTBALL_BASE_URL = 'https://api.football-data.org/v4';

function fetchTodayMatches() {
  try {
    if (isMockMode()) {
      return getMockTodayMatches();
    }

    ensureLiveDataReady_();
    var matches = getTodayMatchesFromSheet();
    return matches.length ? matches : [];
  } catch (error) {
    writeLog('ERROR', 'fetchTodayMatches failed', serializeError(error));
    throw error;
  }
}

function fetchTomorrowMatches() {
  try {
    if (isMockMode()) {
      return getMockTomorrowMatches();
    }

    ensureLiveDataReady_();
    var matches = getTomorrowMatchesFromSheet();
    return matches.length ? matches : [];
  } catch (error) {
    writeLog('ERROR', 'fetchTomorrowMatches failed', serializeError(error));
    throw error;
  }
}

function fetchAllMatches() {
  try {
    if (isMockMode()) {
      return getMockAllMatches();
    }

    ensureLiveDataReady_();
    var matches = getAllMatchesFromSheet();
    return matches.length ? matches : [];
  } catch (error) {
    writeLog('ERROR', 'fetchAllMatches failed', serializeError(error));
    throw error;
  }
}

function fetchGroupMatches(groupName) {
  try {
    var normalizedGroup = String(groupName || '').trim().toUpperCase();
    if (isMockMode()) {
      return getMockAllMatches().filter(function(match) {
        return String(match.group_name || '').trim().toUpperCase() === normalizedGroup;
      });
    }

    ensureLiveDataReady_();
    return getGroupMatchesFromSheet(normalizedGroup);
  } catch (error) {
    writeLog('ERROR', 'fetchGroupMatches failed', serializeError(error));
    throw error;
  }
}

function fetchStandings() {
  try {
    if (isMockMode()) {
      return getMockStandings();
    }

    ensureLiveDataReady_();
    var standings = getStandingsFromSheet();
    return Object.keys(standings).length ? standings : {};
  } catch (error) {
    writeLog('ERROR', 'fetchStandings failed', serializeError(error));
    throw error;
  }
}

function fetchResults() {
  try {
    if (isMockMode()) {
      return getMockResults();
    }

    ensureLiveDataReady_();
    var results = getResultsFromSheet();
    return results.length ? results : [];
  } catch (error) {
    writeLog('ERROR', 'fetchResults failed', serializeError(error));
    throw error;
  }
}

function fetchAllResults() {
  try {
    if (isMockMode()) {
      return getMockAllResults();
    }

    ensureLiveDataReady_();
    var results = getResultsFromSheet();
    return results.length ? results : [];
  } catch (error) {
    writeLog('ERROR', 'fetchAllResults failed', serializeError(error));
    throw error;
  }
}

function goLiveData() {
  try {
    setConfig('USE_MOCK_DATA', 'false');
    var matchCount = syncMatchesToSheet();
    var standingCount = syncStandingsToSheet();
    writeLog('INFO', 'Switched to live football-data.org data', {
      matches: matchCount,
      standings: standingCount
    });
    return createStatusFlex(
      'ใช้ข้อมูลจริงแล้ว',
      'Sync จาก football-data.org สำเร็จ: โปรแกรม ' + matchCount + ' นัด, ตารางคะแนน ' + standingCount + ' แถว'
    );
  } catch (error) {
    writeLog('ERROR', 'goLiveData failed', serializeError(error));
    return createErrorFlex('เปิดข้อมูลจริงไม่สำเร็จ: ' + (error.message || error));
  }
}

function callFootballApi(endpoint) {
  try {
    var apiKey = getConfig('FOOTBALL_DATA_API_KEY');
    if (!apiKey) {
      throw new Error('Missing FOOTBALL_DATA_API_KEY in settings sheet');
    }

    var url = endpoint.indexOf('http') === 0 ? endpoint : FOOTBALL_BASE_URL + endpoint;
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        'X-Auth-Token': apiKey
      },
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    var body = response.getContentText();
    if (code < 200 || code >= 300) {
      throw new Error('football-data.org API error ' + code + ': ' + body);
    }

    return JSON.parse(body);
  } catch (error) {
    writeLog('ERROR', 'callFootballApi failed: ' + endpoint, serializeError(error));
    throw error;
  }
}

function syncMatchesToSheet() {
  try {
    var data = callFootballApi('/competitions/WC/matches');
    var matches = normalizeFootballMatches_(data.matches || []);
    saveMatches(matches);
    writeLog('INFO', 'Synced matches', { count: matches.length });
    return matches.length;
  } catch (error) {
    writeLog('ERROR', 'syncMatchesToSheet failed', serializeError(error));
    throw error;
  }
}

function syncStandingsToSheet() {
  try {
    var data = callFootballApi('/competitions/WC/standings');
    var rows = normalizeFootballStandings_(data.standings || []);
    saveStandings(rows);
    writeLog('INFO', 'Synced standings', { count: rows.length });
    return rows.length;
  } catch (error) {
    writeLog('ERROR', 'syncStandingsToSheet failed', serializeError(error));
    throw error;
  }
}

function getGroupStandingData(groupName) {
  var normalizedGroup = String(groupName || '').trim().toUpperCase();
  if (isMockMode()) {
    return getMockStandings()[normalizedGroup] || [];
  }
  ensureLiveDataReady_();
  return getGroupStandingFromSheet(normalizedGroup);
}

function isMockMode() {
  var value = getConfig('USE_MOCK_DATA');
  return String(value || '').toLowerCase() === 'true';
}

function ensureLiveDataReady_() {
  var hasMatches = getAllMatchesFromSheet().length > 0;
  var hasStandings = Object.keys(getStandingsFromSheet()).length > 0;
  if (!hasMatches) {
    syncMatchesToSheet();
  }
  if (!hasStandings) {
    syncStandingsToSheet();
  }
}

function normalizeFootballMatches_(apiMatches) {
  return apiMatches.map(function(match) {
    var utcDate = match.utcDate ? new Date(match.utcDate) : '';
    return {
      match_id: match.id || '',
      competition: match.competition && match.competition.name || 'FIFA World Cup',
      stage: match.stage || '',
      group_name: extractGroupName_(match.group || match.stage || ''),
      home_team: formatTeamName_(match.homeTeam),
      away_team: formatTeamName_(match.awayTeam),
      home_score: normalizeScore_(match.score && match.score.fullTime ? match.score.fullTime.home : ''),
      away_score: normalizeScore_(match.score && match.score.fullTime ? match.score.fullTime.away : ''),
      match_time_utc: match.utcDate || '',
      match_time_th: utcDate ? formatThaiDateTime_(utcDate) : '',
      status: match.status || '',
      venue: match.venue || '',
      updated_at: new Date()
    };
  });
}

function normalizeFootballStandings_(apiStandings) {
  var rows = [];
  apiStandings.forEach(function(group) {
    var groupName = extractGroupName_(group.group || group.stage || '');
    (group.table || []).forEach(function(team) {
      rows.push({
        group_name: groupName,
        position: team.position || '',
        team_name: formatTeamName_(team.team),
        played: team.playedGames || 0,
        won: team.won || 0,
        draw: team.draw || 0,
        lost: team.lost || 0,
        goals_for: team.goalsFor || 0,
        goals_against: team.goalsAgainst || 0,
        goal_difference: team.goalDifference || 0,
        points: team.points || 0,
        updated_at: new Date()
      });
    });
  });
  return rows;
}

function extractGroupName_(value) {
  var text = String(value || '').toUpperCase();
  var match = text.match(/[A-L]$/);
  return match ? match[0] : text.replace('GROUP_', '').replace('GROUP ', '').trim();
}

function formatThaiDateTime_(date) {
  return Utilities.formatDate(date, getConfiguredTimeZone_(), 'yyyy-MM-dd HH:mm');
}

function normalizeScore_(score) {
  return score === null || score === undefined ? '' : score;
}

function formatTeamName_(team) {
  if (!team) {
    return '';
  }

  var name = team.shortName || team.name || team.tla || '';
  var flag = getFlagForTeam_(team);
  return flag ? name + ' ' + flag : name;
}

function getFlagForTeam_(team) {
  var key = String(team.tla || team.shortName || team.name || '').toUpperCase();
  var name = String(team.name || team.shortName || '').toUpperCase();
  var flags = {
    ALG: '🇩🇿',
    ARG: '🇦🇷',
    AUS: '🇦🇺',
    AUT: '🇦🇹',
    BEL: '🇧🇪',
    BIH: '🇧🇦',
    BRA: '🇧🇷',
    CAN: '🇨🇦',
    CHI: '🇨🇱',
    CIV: '🇨🇮',
    CMR: '🇨🇲',
    COL: '🇨🇴',
    CRC: '🇨🇷',
    CRO: '🇭🇷',
    COD: '🇨🇩',
    CPV: '🇨🇻',
    CUR: '🇨🇼',
    CUW: '🇨🇼',
    CZE: '🇨🇿',
    DEN: '🇩🇰',
    ECU: '🇪🇨',
    EGY: '🇪🇬',
    ENG: '🏴',
    ESP: '🇪🇸',
    FRA: '🇫🇷',
    GER: '🇩🇪',
    GHA: '🇬🇭',
    HAI: '🇭🇹',
    IRN: '🇮🇷',
    IRQ: '🇮🇶',
    ITA: '🇮🇹',
    JAM: '🇯🇲',
    JOR: '🇯🇴',
    JPN: '🇯🇵',
    KOR: '🇰🇷',
    MAR: '🇲🇦',
    MEX: '🇲🇽',
    NGA: '🇳🇬',
    NED: '🇳🇱',
    NZL: '🇳🇿',
    NOR: '🇳🇴',
    PAN: '🇵🇦',
    PAR: '🇵🇾',
    PER: '🇵🇪',
    POL: '🇵🇱',
    POR: '🇵🇹',
    QAT: '🇶🇦',
    RSA: '🇿🇦',
    KSA: '🇸🇦',
    SCO: '🏴',
    SEN: '🇸🇳',
    SRB: '🇷🇸',
    SUI: '🇨🇭',
    SWE: '🇸🇪',
    THA: '🇹🇭',
    TUN: '🇹🇳',
    TUR: '🇹🇷',
    UKR: '🇺🇦',
    URU: '🇺🇾',
    URY: '🇺🇾',
    USA: '🇺🇸',
    UZB: '🇺🇿',
    WAL: '🏴',
    ZAF: '🇿🇦'
  };

  if (flags[key]) {
    return flags[key];
  }
  if (name.indexOf('SOUTH AFRICA') >= 0) return '🇿🇦';
  if (name.indexOf('SOUTH KOREA') >= 0 || name.indexOf('KOREA') >= 0) return '🇰🇷';
  if (name.indexOf('BOSNIA') >= 0) return '🇧🇦';
  if (name.indexOf('CZECH') >= 0) return '🇨🇿';
  if (name.indexOf('CURA') >= 0) return '🇨🇼';
  if (name.indexOf('CAPE VERDE') >= 0) return '🇨🇻';
  if (name.indexOf('CONGO') >= 0) return '🇨🇩';
  if (name.indexOf('UZBEK') >= 0) return '🇺🇿';
  if (name.indexOf('IRAQ') >= 0) return '🇮🇶';
  if (name.indexOf('JORDAN') >= 0) return '🇯🇴';
  if (name.indexOf('AUSTRIA') >= 0) return '🇦🇹';
  if (name.indexOf('IVORY COAST') >= 0) return '🇨🇮';
  if (name.indexOf('UNITED STATES') >= 0) return '🇺🇸';
  if (name.indexOf('SWITZERLAND') >= 0) return '🇨🇭';
  if (name.indexOf('MOROCCO') >= 0) return '🇲🇦';
  return '';
}
