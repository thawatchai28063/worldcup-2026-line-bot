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

function createScheduleMenuFlex() {
  return {
    type: 'flex',
    altText: 'Schedule Menu',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: createHeader_('Schedule Menu', '⚽ World Cup 2026'),
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createText_('เลือกโปรแกรมที่ต้องการดู', 'sm', FLEX_COLORS.gray, false, 'wrap')
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          createMessageButton_('Today', '/today'),
          createMessageButton_('Tomorrow', '/tomorrow'),
          createMessageButton_('Group Stage', '/groupstage'),
          createMessageButton_('Knockout', '/knockout'),
          createMessageButton_('Results', '/results')
        ]
      }
    }
  };
}

function createGroupScheduleFlexMessages(groupName, matches) {
  if (!matches || !matches.length) {
    return [createErrorFlex('ยังไม่มีข้อมูล Group ' + groupName + ' ในตอนนี้')];
  }

  return chunkArray_(matches.slice(0, 12), 6).slice(0, 2).map(function(matchChunk, index) {
    return createMatchesFlex_(
      index === 0 ? 'โปรแกรม Group ' + groupName : 'โปรแกรม Group ' + groupName + ' ' + (index + 1),
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
  return [createStandingsMenuFlex()];
}

function createStandingsMenuFlex() {
  return {
    type: 'flex',
    altText: 'Standings Menu',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: createHeader_('Standings Menu', '⚽ World Cup 2026'),
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createText_('เลือกช่วงกลุ่มที่ต้องการดูตารางคะแนน', 'sm', FLEX_COLORS.gray, false, 'wrap')
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          createMessageButton_('Group A-C', '/standings1'),
          createMessageButton_('Group D-F', '/standings2'),
          createMessageButton_('Group G-I', '/standings3'),
          createMessageButton_('Group J-L', '/standings4'),
          createMessageButton_('เลือกกลุ่มละเอียด', '/groups')
        ]
      }
    }
  };
}

function createGroupSelectMenuFlex() {
  var groups = 'ABCDEFGHIJKL'.split('');
  return {
    type: 'flex',
    altText: 'เลือกกลุ่มตารางคะแนน',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: createHeader_('เลือกกลุ่ม', '⚽ World Cup 2026'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          createText_('กดเลือก Group ที่ต้องการดูตารางคะแนนละเอียด', 'sm', FLEX_COLORS.gray, false, 'wrap')
        ].concat(chunkArray_(groups, 4).map(function(row) {
          return {
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            contents: row.map(function(groupName) {
              return createGroupSelectButton_(groupName);
            })
          };
        }))
      }
    }
  };
}

function createGroupSelectButton_(groupName) {
  return {
    type: 'button',
    flex: 1,
    height: 'sm',
    style: 'secondary',
    action: {
      type: 'message',
      label: groupName,
      text: '/' + groupName
    }
  };
}

function createStandingsRangeFlexMessage(standings, rangeIndex) {
  var ranges = [
    ['A', 'B', 'C'],
    ['D', 'E', 'F'],
    ['G', 'H', 'I'],
    ['J', 'K', 'L']
  ];
  var groups = ranges[Number(rangeIndex || 1) - 1] || ranges[0];
  var message = createStandingsCarouselForGroups_(standings, groups, false);

  console.log('Flex payload size KB:', getPayloadSizeKb(message));
  if (getPayloadSizeKb(message) <= 45) {
    return message;
  }

  var compactMessage = createStandingsCarouselForGroups_(standings, groups, true);
  console.log('Flex payload size KB compact:', getPayloadSizeKb(compactMessage));
  if (getPayloadSizeKb(compactMessage) <= 45) {
    return compactMessage;
  }

  return createStandingsTextFallback_(standings, groups, true);
}

function createStandingsCarouselForGroups_(standings, groups, compact) {
  var availableGroups = groups.filter(function(groupName) {
    return (standings || {})[groupName];
  });
  if (!availableGroups.length) {
    return createErrorFlex('ยังไม่มีข้อมูลในตอนนี้');
  }

  return {
    type: 'flex',
    altText: 'ตารางคะแนน World Cup 2026 Group ' + groups.join('-'),
    contents: {
      type: 'carousel',
      contents: availableGroups.map(function(groupName) {
        return createStandingBubble_(groupName, standings[groupName] || [], true, compact);
      })
    }
  };
}

function createGroupStandingFlex(groupName, teams) {
  if (!teams || !teams.length) {
    return createErrorFlex('ยังไม่มีข้อมูลในตอนนี้');
  }

  return {
    type: 'flex',
    altText: 'ตารางคะแนน Group ' + groupName,
    contents: createStandingBubble_(groupName, teams, false, false)
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
      },
      footer: createActionFooter_()
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
        },
        footer: createActionFooter_()
      }
    };
  });
}

function createKnockoutStageFlexMessages(matches, title) {
  if (!matches || !matches.length) {
    return [createErrorFlex('ยังไม่มีข้อมูลรอบนี้ในตอนนี้')];
  }

  return chunkArray_(matches.slice(0, 18), 6).slice(0, 3).map(function(matchChunk, index) {
    return createMatchesFlex_(
      index === 0 ? title : title + ' ' + (index + 1),
      matchChunk,
      'Knockout'
    );
  });
}

function stageDisplayName_(stageName) {
  var names = {
    ROUND_OF_32: 'Round of 32',
    ROUND_OF_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-finals',
    SEMI_FINALS: 'Semi-finals',
    THIRD_PLACE: 'Third place',
    FINAL: 'Final',
    GROUP_STAGE: 'Group Stage'
  };
  return names[stageName] || stageName || 'Knockout';
}

function createTextMessage_(text) {
  return {
    type: 'text',
    text: String(text || '')
  };
}

function createHelpFlex() {
  var commands = [
    ['/today', 'โปรแกรมแข่งวันนี้'],
    ['/tomorrow', 'โปรแกรมแข่งพรุ่งนี้'],
    ['/schedule', 'เมนูโปรแกรมแข่ง'],
    ['/schedule A', 'โปรแกรมเฉพาะกลุ่ม A'],
    ['/standings', 'เมนูตารางคะแนน'],
    ['/standings1', 'Group A-C'],
    ['/standings2', 'Group D-F'],
    ['/standings3', 'Group G-I'],
    ['/standings4', 'Group J-L'],
    ['/groups', 'เมนูเลือกกลุ่มละเอียด A-L'],
    ['/knockout', 'เมนูรอบน็อกเอาต์'],
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
  return {
    type: 'flex',
    altText: 'เมนูคำสั่ง',
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F3E78',
        paddingAll: '14px',
        contents: [
          createText_('World Cup 2026', 'xs', '#DDEBFF', true),
          createText_('เมนูคำสั่ง', 'lg', FLEX_COLORS.white, true)
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#F7FAFC',
        contents: [
          createText_('กดเพื่อเปิดรายการคำสั่งทั้งหมด', 'sm', FLEX_COLORS.gray, false, 'wrap')
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createMessageButton_('เปิดเมนู /help', '/help')
        ]
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
      footer: createActionFooter_()
    }
  };
}

function createStandingBubble_(groupName, teams, includeFooter, compact) {
  var rows = teams.slice(0, 4).map(function(team) {
    return createStandingRow_(team, compact);
  });

  var bubble = {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: FLEX_COLORS.navy,
      paddingAll: '16px',
      contents: [
        createText_('FIFA World Cup 2026', 'xs', '#DDEBFF', true),
        createText_('Group ' + groupName, 'xl', FLEX_COLORS.white, true)
      ]
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      backgroundColor: '#F8FAFC',
      contents: [
        createStandingHeader_(compact)
      ].concat(rows.length ? rows : [createText_('ยังไม่มีข้อมูลในตอนนี้', 'sm', FLEX_COLORS.gray, false)])
    }
  };

  if (includeFooter !== false) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        createMessageButton_('Detail', '/' + groupName)
      ]
    };
  }

  return bubble;
}

function createMatchRow_(match) {
  var homeScore = match.home_score !== '' && match.home_score !== undefined ? String(match.home_score) : '-';
  var awayScore = match.away_score !== '' && match.away_score !== undefined ? String(match.away_score) : '-';
  var isScored = homeScore !== '-' || awayScore !== '-';
  var title = isScored
    ? (match.home_team || '-') + ' ' + homeScore + ' - ' + awayScore + ' ' + (match.away_team || '-')
    : (match.home_team || '-') + ' vs ' + (match.away_team || '-');
  return {
    type: 'box',
    layout: 'vertical',
    paddingAll: '12px',
    backgroundColor: FLEX_COLORS.lightGray,
    cornerRadius: '10px',
    spacing: 'xs',
    contents: [
      createText_(title, 'md', '#111827', true, 'wrap'),
      createText_(createMatchMeta_(match), 'xs', FLEX_COLORS.gray, false, 'wrap'),
      createText_('สถานะ ' + translateStatus_(match.status), 'xs', statusColor_(match.status), true),
      createText_('สนาม: ' + (match.venue || '-'), 'xxs', FLEX_COLORS.gray, false, 'wrap')
    ]
  };
}

function createResultRow_(match) {
  var title = (match.home_team || '-') + ' ' + normalizeDisplayScore_(match.home_score) + ' - ' + normalizeDisplayScore_(match.away_score) + ' ' + (match.away_team || '-');
  return {
    type: 'box',
    layout: 'vertical',
    paddingAll: '12px',
    backgroundColor: FLEX_COLORS.lightGray,
    cornerRadius: '10px',
    spacing: 'xs',
    contents: [
      createText_(title, 'md', '#111827', true, 'wrap'),
      createText_(createMatchMeta_(match), 'xs', FLEX_COLORS.gray, false, 'wrap'),
      createText_('สถานะ ' + translateStatus_(match.status || 'FINISHED'), 'xs', statusColor_(match.status || 'FINISHED'), true)
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

function createStandingHeader_(compact) {
  return createStandingTableRow_(
    compact ? ['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pt'] : ['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'GF', 'GA', 'Pt'],
    true,
    FLEX_COLORS.gray,
    false
  );
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
    height: 'sm',
    style: 'secondary',
    action: {
      type: 'message',
      label: label,
      text: text
    }
  };
}

function createKnockoutMenuFlex() {
  return {
    type: 'flex',
    altText: 'Knockout Menu',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: createHeader_('Knockout Menu', '⚽ World Cup 2026'),
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          createText_('เลือกรอบน็อกเอาต์ที่ต้องการดู', 'sm', FLEX_COLORS.gray, false, 'wrap')
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          createMessageButton_('Round of 32', '/round32'),
          createMessageButton_('Round of 16', '/round16'),
          createMessageButton_('Quarter-finals', '/quarter'),
          createMessageButton_('Semi-finals', '/semi'),
          createMessageButton_('Third place', '/third'),
          createMessageButton_('Final', '/final')
        ]
      }
    }
  };
}

function createActionFooter_() {
  return {
    type: 'box',
    layout: 'vertical',
    spacing: 'sm',
    contents: createFooterButtons_()
  };
}

function createFooterButtons_() {
  return [
    createMessageButton_('ดูผลทั้งหมด', '/allresults'),
    createMessageButton_('ตารางคะแนน', '/standings'),
    createMessageButton_('โปรแกรมวันนี้', '/today')
  ];
}

function createMatchMeta_(match) {
  var groupName = match.group_name ? 'Group ' + String(match.group_name).toUpperCase() : (match.stage || 'World Cup');
  return groupName + ' · ' + formatDisplayDate_(match.match_time_th || match.match_time_utc);
}

function formatDisplayDate_(value) {
  if (!value) {
    return '-';
  }

  var raw = String(value);
  var plainMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (plainMatch) {
    var display = Number(plainMatch[3]) + ' ' + thaiMonth_(Number(plainMatch[2])) + ' ' + plainMatch[1];
    if (plainMatch[4] && plainMatch[5]) {
      display += ' · ' + plainMatch[4] + ':' + plainMatch[5] + ' น.';
    }
    return display;
  }

  var parsed = value instanceof Date ? value : new Date(value);
  if (isNaN(parsed.getTime())) {
    return raw;
  }

  return Utilities.formatDate(parsed, getConfiguredTimeZone_(), 'd') + ' ' +
    thaiMonth_(Number(Utilities.formatDate(parsed, getConfiguredTimeZone_(), 'M'))) + ' ' +
    Utilities.formatDate(parsed, getConfiguredTimeZone_(), 'yyyy') + ' · ' +
    Utilities.formatDate(parsed, getConfiguredTimeZone_(), 'HH:mm') + ' น.';
}

function thaiMonth_(month) {
  var months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return months[month - 1] || '';
}

function normalizeDisplayScore_(score) {
  return score === '' || score === null || score === undefined ? '-' : String(score);
}

function formatSignedNumber_(value) {
  var number = Number(value || 0);
  return number > 0 ? '+' + number : String(number);
}

function createStandingLine_(team, compact) {
  var values = [
    String(team.position || '') + '.',
    team.team_name || '-',
    String(team.played || 0),
    String(team.won || 0),
    String(team.draw || 0),
    String(team.lost || 0),
    formatSignedNumber_(team.goal_difference || 0)
  ];
  if (!compact) {
    values.push(String(team.goals_for || 0));
    values.push(String(team.goals_against || 0));
  }
  values.push(String(team.points || 0));
  return values.join(' ');
}

function createStandingRow_(team, compact) {
  var values = [
    String(team.position || ''),
    team.team_name || '-',
    String(team.played || 0),
    String(team.won || 0),
    String(team.draw || 0),
    String(team.lost || 0),
    formatSignedNumber_(team.goal_difference || 0)
  ];
  if (!compact) {
    values.push(String(team.goals_for || 0));
    values.push(String(team.goals_against || 0));
  }
  values.push(String(team.points || 0));

  return createStandingTableRow_(values, Boolean(team.position === 1), '#111827', true);
}

function createStandingTableRow_(values, bold, color, bodyRow) {
  var cells = values.map(function(value, index) {
    var isTeam = index === 1;
    var cell = createText_(
      value,
      'xxs',
      color || '#111827',
      bold,
      isTeam ? 'wrap' : 'none',
      standingCellFlex_(index, values.length)
    );
    if (!isTeam) {
      cell.align = index === 0 ? 'start' : 'end';
    }
    return cell;
  });

  var row = {
    type: 'box',
    layout: 'horizontal',
    spacing: 'xxs',
    contents: cells
  };
  if (bodyRow) {
    row.paddingAll = '5px';
    row.cornerRadius = '6px';
    row.backgroundColor = bold ? '#EEF6FF' : FLEX_COLORS.white;
  }
  return row;
}

function standingCellFlex_(index, length) {
  if (index === 0) return 1;
  if (index === 1) return length >= 10 ? 8 : 9;
  if (length >= 10 && (index === 6 || index === 7 || index === 8)) return 2;
  return 1;
}

function createStandingsTextFallback_(standings, groups, compact) {
  var lines = ['ตารางคะแนน World Cup 2026'];
  groups.forEach(function(groupName) {
    lines.push('');
    lines.push('Group ' + groupName);
    lines.push(compact ? '# Team P W D L GD Pt' : '# Team P W D L GD GF GA Pt');
    ((standings || {})[groupName] || []).slice(0, 4).forEach(function(team) {
      lines.push(createStandingLine_(team, compact));
    });
  });
  return {
    type: 'text',
    text: lines.join('\n')
  };
}

function getPayloadSizeKb(obj) {
  return Utilities.newBlob(JSON.stringify(obj)).getBytes().length / 1024;
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
