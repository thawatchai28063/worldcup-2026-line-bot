var FLEX_COLORS = {
  navy: '#103B73',
  blue: '#1D74D8',
  green: '#0F9F6E',
  red: '#D14343',
  gray: '#6B7280',
  lightGray: '#F3F6FA',
  white: '#FFFFFF'
};

function createTodayMatchesFlex(matches) {
  return createMatchesFlex_('โปรแกรมวันนี้', matches, 'ดูตารางทั้งหมด');
}

function createTomorrowMatchesFlex(matches) {
  return createMatchesFlex_('โปรแกรมพรุ่งนี้', matches, 'ดูตารางทั้งหมด');
}

function createScheduleFlexMessages(matches) {
  if (!matches || !matches.length) {
    return [createErrorFlex('ยังไม่มีข้อมูลในตอนนี้')];
  }

  return chunkArray_(matches.slice(0, 30), 6).slice(0, 5).map(function(matchChunk, index) {
    return createMatchesFlex_(
      index === 0 ? 'โปรแกรมแข่งทั้งหมด' : 'โปรแกรมแข่งทั้งหมด ' + (index + 1),
      matchChunk,
      'ตารางคะแนน'
    );
  });
}

function createStandingsCarouselFlex(standings) {
  var messages = createStandingsFlexMessages(standings);
  return messages[0] || createErrorFlex('ยังไม่มีข้อมูลในตอนนี้');
}

function createStandingsFlexMessages(standings) {
  var groups = Object.keys(standings || {}).sort().slice(0, 12);
  if (!groups.length) {
    return [createErrorFlex('ยังไม่มีข้อมูลในตอนนี้')];
  }

  return chunkArray_(groups, 6).map(function(groupChunk, index) {
    return {
      type: 'flex',
      altText: index === 0 ? 'ตารางคะแนน World Cup 2026 A-F' : 'ตารางคะแนน World Cup 2026 G-L',
      contents: {
        type: 'carousel',
        contents: groupChunk.map(function(groupName) {
          return createStandingBubble_(groupName, standings[groupName] || [], false);
        })
      }
    };
  });
}

function createGroupStandingFlex(groupName, teams) {
  if (!teams || !teams.length) {
    return createErrorFlex('ยังไม่มีข้อมูลในตอนนี้');
  }

  return {
    type: 'flex',
    altText: 'ตารางคะแนน Group ' + groupName,
    contents: createStandingBubble_(groupName, teams, true)
  };
}

function createResultsFlex(results) {
  if (!results || !results.length) {
    return createErrorFlex('ยังไม่มีข้อมูลในตอนนี้');
  }

  return {
    type: 'flex',
      altText: 'ผลบอลล่าสุด 4 คู่',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: createHeader_('ผลบอลล่าสุด 4 คู่', 'World Cup 2026'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: results.slice(0, 4).map(createResultRow_)
      }
    }
  };
}

function createAllResultsFlexMessages(results) {
  if (!results || !results.length) {
    return [createErrorFlex('ยังไม่มีข้อมูลในตอนนี้')];
  }

  return chunkArray_(results.slice(0, 30), 6).slice(0, 5).map(function(resultChunk, index) {
    return {
      type: 'flex',
      altText: index === 0 ? 'ผลการแข่งขันทั้งหมด' : 'ผลการแข่งขันทั้งหมด ' + (index + 1),
      contents: {
        type: 'bubble',
        size: 'mega',
        header: createHeader_(index === 0 ? 'ผลการแข่งขันทั้งหมด' : 'ผลการแข่งขัน ' + (index + 1), 'World Cup 2026'),
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: resultChunk.map(createResultRow_)
        }
      }
    };
  });
}

function createHelpFlex() {
  var commands = [
    ['/today', 'โปรแกรมแข่งวันนี้'],
    ['/tomorrow', 'โปรแกรมแข่งพรุ่งนี้'],
    ['/schedule', 'โปรแกรมแข่งทั้งหมด'],
    ['/standings', 'ตารางคะแนนทุกกลุ่ม'],
    ['/A', 'ตารางคะแนนกลุ่ม A'],
    ['/results', 'ผลบอลล่าสุด'],
    ['/allresults', 'ผลการแข่งขันทั้งหมด'],
    ['/live', 'เปิดใช้ข้อมูลจริง'],
    ['/help', 'ดูคำสั่งทั้งหมด']
  ];

  return {
    type: 'flex',
    altText: 'คำสั่ง World Cup 2026 Bot',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: createHeader_('Command Center', 'World Cup 2026'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: commands.map(function(item) {
          var commandText = createText_(item[0], 'sm', FLEX_COLORS.blue, true, 'none', 4);
          commandText.action = {
            type: 'message',
            label: item[0],
            text: item[0]
          };
          return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'md',
            contents: [
              commandText,
              createText_(item[1], 'sm', FLEX_COLORS.gray, false, 'none', 6)
            ]
          };
        })
      }
    }
  };
}

function createCompactCommandMenuFlex() {
  var commands = [
    ['/today', 'Today'],
    ['/tomorrow', 'Tomorrow'],
    ['/schedule', 'Schedule'],
    ['/standings', 'Standings'],
    ['/results', 'Results'],
    ['/allresults', 'All Results']
  ];

  return {
    type: 'flex',
    altText: 'Command Menu',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F3E78',
        paddingAll: '14px',
        contents: [
          createText_('World Cup 2026', 'xs', '#DDEBFF', true),
          createText_('Next Command', 'lg', FLEX_COLORS.white, true)
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        backgroundColor: '#F7FAFC',
        contents: chunkArray_(commands, 2).map(function(row) {
          return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            contents: row.map(createMenuButton_)
          };
        })
      }
    }
  };
}

function createMenuButton_(item) {
  return {
    type: 'button',
    flex: 1,
    height: 'sm',
    style: 'primary',
    color: FLEX_COLORS.blue,
    action: {
      type: 'message',
      label: item[1],
      text: item[0]
    }
  };
}

function createErrorFlex(message) {
  return {
    type: 'flex',
    altText: message || 'เกิดข้อผิดพลาด',
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: createHeader_('แจ้งเตือน', 'World Cup 2026'),
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createText_(message || 'เกิดข้อผิดพลาด', 'md', FLEX_COLORS.red, true)
        ]
      }
    }
  };
}

function createCommandButtonCard_(item) {
  return {
    type: 'box',
    layout: 'vertical',
    flex: 1,
    paddingAll: '14px',
    cornerRadius: '10px',
    backgroundColor: FLEX_COLORS.white,
    borderColor: '#D9E4F2',
    borderWidth: '1px',
    action: {
      type: 'message',
      label: item[1],
      text: item[0]
    },
    contents: [
      createText_(item[1], 'md', '#10233F', true, 'wrap'),
      createText_(item[0], 'xs', FLEX_COLORS.blue, true),
      createText_(item[2], 'xxs', FLEX_COLORS.gray, false, 'wrap')
    ]
  };
}

function createStatusFlex(title, message) {
  return {
    type: 'flex',
    altText: title || 'สถานะระบบ',
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: createHeader_(title || 'สถานะระบบ', 'World Cup 2026'),
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createText_(message || 'ดำเนินการสำเร็จ', 'md', FLEX_COLORS.green, true, 'wrap')
        ]
      }
    }
  };
}

function createMatchesFlex_(title, matches, buttonLabel) {
  if (!matches || !matches.length) {
    return createErrorFlex('ยังไม่มีข้อมูลในตอนนี้');
  }

  return {
    type: 'flex',
    altText: title + ' World Cup 2026',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: createHeader_(title, '⚽ World Cup 2026'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: matches.slice(0, 8).map(createMatchRow_)
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createUriButton_(buttonLabel, getConfig('BASE_DASHBOARD_URL') || 'https://www.fifa.com/')
        ]
      }
    }
  };
}

function createStandingBubble_(groupName, teams, includeFooter) {
  var rows = teams.slice(0, 4).map(function(team) {
    return {
      type: 'box',
      layout: 'horizontal',
      spacing: 'xs',
      contents: [
        createText_(String(team.position || ''), 'xxs', FLEX_COLORS.gray, false, 'none', 1),
        createText_(team.team_name || '-', 'xxs', '#111827', true, 'wrap', 6),
        createText_(String(team.played || 0), 'xxs', FLEX_COLORS.gray, false, 'none', 1),
        createText_(String(team.won || 0), 'xxs', FLEX_COLORS.gray, false, 'none', 1),
        createText_(String(team.draw || 0), 'xxs', FLEX_COLORS.gray, false, 'none', 1),
        createText_(String(team.lost || 0), 'xxs', FLEX_COLORS.gray, false, 'none', 1),
        createText_(String(team.points || 0), 'xxs', FLEX_COLORS.navy, true, 'none', 1)
      ]
    };
  });

  return {
    type: 'bubble',
    size: 'kilo',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: FLEX_COLORS.navy,
      paddingAll: '12px',
      contents: [
        createText_('Group ' + groupName, 'md', FLEX_COLORS.white, true)
      ]
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        createStandingHeader_()
      ].concat(rows.length ? rows : [createText_('ยังไม่มีข้อมูลในตอนนี้', 'sm', FLEX_COLORS.gray, false)])
    }
  };

  if (includeFooter !== false) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        createMessageButton_('Schedule', '/วันนี้'),
        createUriButton_('Dashboard', getConfig('BASE_DASHBOARD_URL') || 'https://www.fifa.com/')
      ]
    };
  }

  return bubble;
}

function createMatchRow_(match) {
  var homeScore = match.home_score !== '' && match.home_score !== undefined ? String(match.home_score) : '-';
  var awayScore = match.away_score !== '' && match.away_score !== undefined ? String(match.away_score) : '-';
  var title = (match.home_team || '-') + ' ' + homeScore + ' - ' + awayScore + ' ' + (match.away_team || '-');
  return {
    type: 'box',
    layout: 'vertical',
    paddingAll: '10px',
    backgroundColor: FLEX_COLORS.lightGray,
    cornerRadius: '8px',
    spacing: 'xs',
    contents: [
      createText_(title, 'sm', '#111827', true, 'wrap'),
      createText_('เวลาไทย: ' + (match.match_time_th || '-'), 'xs', FLEX_COLORS.gray, false),
      createText_('สถานะ: ' + translateStatus_(match.status), 'xs', statusColor_(match.status), true),
      createText_('สนาม: ' + (match.venue || '-'), 'xxs', FLEX_COLORS.gray, false, 'wrap')
    ]
  };
}

function createResultRow_(match) {
  var title = (match.home_team || '-') + ' ' + (match.home_score || 0) + ' - ' + (match.away_score || 0) + ' ' + (match.away_team || '-');
  return {
    type: 'box',
    layout: 'vertical',
    paddingAll: '10px',
    backgroundColor: FLEX_COLORS.lightGray,
    cornerRadius: '8px',
    contents: [
      createText_(title, 'sm', '#111827', true, 'wrap'),
      createText_('Status: ' + (match.status || 'Finished'), 'xs', FLEX_COLORS.green, true)
    ]
  };
}

function createHeader_(title, subtitle) {
  return {
    type: 'box',
    layout: 'vertical',
    backgroundColor: FLEX_COLORS.navy,
    paddingAll: '16px',
    contents: [
      createText_(subtitle, 'xs', '#DDEBFF', true),
      createText_(title, 'xl', FLEX_COLORS.white, true, 'wrap')
    ]
  };
}

function createStandingHeader_() {
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'xs',
    contents: [
      createText_('#', 'xxs', FLEX_COLORS.gray, true, 'none', 1),
      createText_('Team', 'xxs', FLEX_COLORS.gray, true, 'none', 5),
      createText_('P', 'xxs', FLEX_COLORS.gray, true, 'none', 1),
      createText_('W', 'xxs', FLEX_COLORS.gray, true, 'none', 1),
      createText_('D', 'xxs', FLEX_COLORS.gray, true, 'none', 1),
      createText_('L', 'xxs', FLEX_COLORS.gray, true, 'none', 1),
      createText_('Pt', 'xxs', FLEX_COLORS.gray, true, 'none', 1)
    ]
  };
}

function createText_(text, size, color, weight, wrap, flex) {
  var node = {
    type: 'text',
    text: String(text || ''),
    size: size || 'sm',
    color: color || '#111827',
    weight: weight ? 'bold' : 'regular',
    wrap: wrap === 'wrap'
  };
  if (wrap === 'none') {
    node.wrap = false;
  }
  if (flex !== undefined) {
    node.flex = flex;
  }
  return node;
}

function createUriButton_(label, uri) {
  return {
    type: 'button',
    style: 'primary',
    color: FLEX_COLORS.blue,
    action: {
      type: 'uri',
      label: label,
      uri: uri
    }
  };
}

function createMessageButton_(label, text) {
  return {
    type: 'button',
    style: 'secondary',
    action: {
      type: 'message',
      label: label,
      text: text
    }
  };
}

function translateStatus_(status) {
  var text = String(status || '').toUpperCase();
  if (text === 'SCHEDULED' || text === 'TIMED') {
    return 'ยังไม่เริ่ม';
  }
  if (text === 'IN_PLAY' || text === 'LIVE') {
    return 'กำลังแข่ง';
  }
  if (text === 'FINISHED' || text === 'FT') {
    return 'จบการแข่งขัน';
  }
  return status || '-';
}

function statusColor_(status) {
  var text = String(status || '').toUpperCase();
  if (text === 'FINISHED' || text === 'FT') {
    return FLEX_COLORS.green;
  }
  if (text === 'IN_PLAY' || text === 'LIVE') {
    return FLEX_COLORS.red;
  }
  return FLEX_COLORS.gray;
}

function chunkArray_(items, size) {
  var chunks = [];
  for (var i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
