function getMockTodayMatches() {
  return [
    createMockMatch_('M001', 'Group A', 'A', 'Brazil 🇧🇷', 'Japan 🇯🇵', '', '', '2026-06-15T15:00:00Z', '22:00', 'SCHEDULED', 'MetLife Stadium'),
    createMockMatch_('M002', 'Group B', 'B', 'Germany 🇩🇪', 'Mexico 🇲🇽', '', '', '2026-06-15T18:00:00Z', '01:00', 'SCHEDULED', 'AT&T Stadium'),
    createMockMatch_('M003', 'Group C', 'C', 'Thailand 🇹🇭', 'USA 🇺🇸', '', '', '2026-06-15T21:00:00Z', '04:00', 'SCHEDULED', 'SoFi Stadium')
  ];
}

function getMockTomorrowMatches() {
  return [
    createMockMatch_('M004', 'Group D', 'D', 'Argentina 🇦🇷', 'Korea Republic 🇰🇷', '', '', '2026-06-16T15:00:00Z', '22:00', 'SCHEDULED', 'Hard Rock Stadium'),
    createMockMatch_('M005', 'Group E', 'E', 'France 🇫🇷', 'Canada 🇨🇦', '', '', '2026-06-16T18:00:00Z', '01:00', 'SCHEDULED', 'BC Place')
  ];
}

function getMockAllMatches() {
  return getMockTodayMatches().concat(getMockTomorrowMatches());
}

function getMockResults() {
  return [
    createMockMatch_('M900', 'Group A', 'A', 'Brazil 🇧🇷', 'Japan 🇯🇵', 2, 1, '2026-06-14T15:00:00Z', '22:00', 'FINISHED', 'MetLife Stadium'),
    createMockMatch_('M901', 'Group B', 'B', 'Germany 🇩🇪', 'Mexico 🇲🇽', 1, 1, '2026-06-14T18:00:00Z', '01:00', 'FINISHED', 'AT&T Stadium'),
    createMockMatch_('M902', 'Group C', 'C', 'Spain 🇪🇸', 'Morocco 🇲🇦', 3, 0, '2026-06-14T21:00:00Z', '04:00', 'FINISHED', 'Lumen Field')
  ];
}

function getMockAllResults() {
  return [
    createMockMatch_('M880', 'Group A', 'A', 'Brazil 🇧🇷', 'Japan 🇯🇵', 2, 1, '2026-06-11T15:00:00Z', '11 มิ.ย. 22:00', 'FINISHED', 'MetLife Stadium'),
    createMockMatch_('M881', 'Group A', 'A', 'Scotland 🏴', 'Ghana 🇬🇭', 0, 0, '2026-06-11T18:00:00Z', '12 มิ.ย. 01:00', 'FINISHED', 'AT&T Stadium'),
    createMockMatch_('M882', 'Group B', 'B', 'Germany 🇩🇪', 'Mexico 🇲🇽', 1, 1, '2026-06-12T15:00:00Z', '12 มิ.ย. 22:00', 'FINISHED', 'Lumen Field'),
    createMockMatch_('M883', 'Group B', 'B', 'Norway 🇳🇴', 'New Zealand 🇳🇿', 2, 0, '2026-06-12T18:00:00Z', '13 มิ.ย. 01:00', 'FINISHED', 'BC Place'),
    createMockMatch_('M884', 'Group C', 'C', 'Thailand 🇹🇭', 'USA 🇺🇸', 1, 2, '2026-06-13T15:00:00Z', '13 มิ.ย. 22:00', 'FINISHED', 'SoFi Stadium'),
    createMockMatch_('M885', 'Group C', 'C', 'Spain 🇪🇸', 'Morocco 🇲🇦', 3, 0, '2026-06-13T18:00:00Z', '14 มิ.ย. 01:00', 'FINISHED', 'Lumen Field'),
    createMockMatch_('M900', 'Group A', 'A', 'Brazil 🇧🇷', 'Japan 🇯🇵', 2, 1, '2026-06-14T15:00:00Z', '14 มิ.ย. 22:00', 'FINISHED', 'MetLife Stadium'),
    createMockMatch_('M901', 'Group B', 'B', 'Germany 🇩🇪', 'Mexico 🇲🇽', 1, 1, '2026-06-14T18:00:00Z', '15 มิ.ย. 01:00', 'FINISHED', 'AT&T Stadium'),
    createMockMatch_('M902', 'Group C', 'C', 'Spain 🇪🇸', 'Morocco 🇲🇦', 3, 0, '2026-06-14T21:00:00Z', '15 มิ.ย. 04:00', 'FINISHED', 'Lumen Field')
  ];
}

function getMockStandings() {
  var groups = {};
  var names = {
    A: ['Brazil 🇧🇷', 'Japan 🇯🇵', 'Scotland 🏴', 'Ghana 🇬🇭'],
    B: ['Germany 🇩🇪', 'Mexico 🇲🇽', 'Norway 🇳🇴', 'New Zealand 🇳🇿'],
    C: ['Thailand 🇹🇭', 'USA 🇺🇸', 'Spain 🇪🇸', 'Morocco 🇲🇦'],
    D: ['Argentina 🇦🇷', 'Korea Republic 🇰🇷', 'Egypt 🇪🇬', 'Jamaica 🇯🇲'],
    E: ['France 🇫🇷', 'Canada 🇨🇦', 'Senegal 🇸🇳', 'Chile 🇨🇱'],
    F: ['England 🏴', 'Uruguay 🇺🇾', 'Qatar 🇶🇦', 'Nigeria 🇳🇬'],
    G: ['Portugal 🇵🇹', 'Australia 🇦🇺', 'Colombia 🇨🇴', 'Tunisia 🇹🇳'],
    H: ['Netherlands 🇳🇱', 'Croatia 🇭🇷', 'Saudi Arabia 🇸🇦', 'Peru 🇵🇪'],
    I: ['Italy 🇮🇹', 'Ecuador 🇪🇨', 'Wales 🏴', 'Cameroon 🇨🇲'],
    J: ['Belgium 🇧🇪', 'Denmark 🇩🇰', 'Costa Rica 🇨🇷', 'South Africa 🇿🇦'],
    K: ['Switzerland 🇨🇭', 'Poland 🇵🇱', 'Iran 🇮🇷', 'Panama 🇵🇦'],
    L: ['Sweden 🇸🇪', 'Serbia 🇷🇸', 'Paraguay 🇵🇾', 'Algeria 🇩🇿']
  };

  Object.keys(names).forEach(function(groupName) {
    groups[groupName] = names[groupName].map(function(teamName, index) {
      var points = Math.max(0, 7 - index * 2);
      return {
        group_name: groupName,
        position: index + 1,
        team_name: teamName,
        played: 3,
        won: index === 0 ? 2 : index === 1 ? 1 : 0,
        draw: index === 2 ? 2 : 1,
        lost: index === 3 ? 2 : 0,
        goals_for: 5 - index,
        goals_against: 2 + index,
        goal_difference: 3 - index * 2,
        points: points,
        updated_at: new Date()
      };
    });
  });

  return groups;
}

function createMockMatch_(id, stage, groupName, homeTeam, awayTeam, homeScore, awayScore, utcTime, thaiTime, status, venue) {
  return {
    match_id: id,
    competition: 'FIFA World Cup 2026',
    stage: stage,
    group_name: groupName,
    home_team: homeTeam,
    away_team: awayTeam,
    home_score: homeScore,
    away_score: awayScore,
    match_time_utc: utcTime,
    match_time_th: thaiTime,
    status: status,
    venue: venue,
    updated_at: new Date()
  };
}
