var LINE_REPLY_ENDPOINT = 'https://api.line.me/v2/bot/message/reply';
var LINE_PUSH_ENDPOINT = 'https://api.line.me/v2/bot/message/push';

function runSetupSheets() {
  setupSheets();
}

function showSpreadsheetUrl() {
  var spreadsheet = getSpreadsheet_();
  var url = spreadsheet.getUrl();
  Logger.log(url);
  return url;
}

function testLineConfig() {
  var token = getConfig('LINE_CHANNEL_ACCESS_TOKEN');
  var secret = getConfig('LINE_CHANNEL_SECRET');
  var mockMode = getConfig('USE_MOCK_DATA');
  var result = {
    spreadsheetUrl: getSpreadsheet_().getUrl(),
    hasLineToken: Boolean(token),
    lineTokenLength: token ? token.length : 0,
    hasLineSecret: Boolean(secret),
    lineSecretLength: secret ? secret.length : 0,
    useMockData: mockMode
  };
  Logger.log(JSON.stringify(result, null, 2));
  writeLog('INFO', 'testLineConfig', result);
  return result;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      writeLog('WARN', 'Empty webhook payload', {});
      return createJsonResponse({ ok: true, message: 'empty payload' });
    }

    var body = JSON.parse(e.postData.contents);
    var events = body.events || [];

    events.forEach(function(event) {
      handleLineEvent(event);
    });

    return createJsonResponse({ ok: true });
  } catch (error) {
    writeLog('ERROR', 'doPost failed', serializeError(error));
    return createJsonResponse({ ok: false, message: error.message });
  }
}

function doGet(e) {
  try {
    var matches = getAllMatchesFromSheet();
    var standings = getStandingsFromSheet();
    var results = getResultsFromSheet();
    return createJsonResponse({
      ok: true,
      useMockData: getConfig('USE_MOCK_DATA'),
      matchCount: matches.length,
      resultCount: results.length,
      standingGroups: Object.keys(standings).length,
      firstMatch: matches[0] || null,
      latestResult: results[results.length - 1] || null
    });
  } catch (error) {
    return createJsonResponse({
      ok: false,
      message: error.message
    });
  }
}

function handleLineEvent(event) {
  try {
    writeLog('INFO', 'Received LINE event', {
      type: event && event.type,
      messageType: event && event.message && event.message.type,
      text: event && event.message && event.message.text,
      hasReplyToken: Boolean(event && event.replyToken)
    });

    if (!event || event.type !== 'message' || !event.message || event.message.type !== 'text') {
      writeLog('INFO', 'Ignored unsupported event', event || {});
      return;
    }

    handleTextCommand(event.replyToken, String(event.message.text || '').trim());
  } catch (error) {
    writeLog('ERROR', 'handleLineEvent failed', serializeError(error));
    if (event && event.replyToken) {
      replyMessage(event.replyToken, [createErrorFlex('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')]);
    }
  }
}

function handleTextCommand(replyToken, userMessage) {
  try {
    var command = resolveCommand_(userMessage);
    var messages;

    if (command === '/ข้อมูลจริง') {
      messages = [goLiveData()];
    } else if (command === '/วันนี้') {
      messages = [createTodayMatchesFlex(fetchTodayMatches())];
    } else if (command === '/พรุ่งนี้') {
      messages = [createTomorrowMatchesFlex(fetchTomorrowMatches())];
    } else if (command.indexOf('/โปรแกรมกลุ่ม ') === 0) {
      var scheduleGroupName = command.replace('/โปรแกรมกลุ่ม ', '').trim().toUpperCase();
      messages = createGroupScheduleFlexMessages(scheduleGroupName, fetchGroupMatches(scheduleGroupName));
    } else if (command === '/โปรแกรมรอบแบ่งกลุ่ม') {
      messages = createScheduleFlexMessages(fetchGroupStageMatches());
    } else if (command === '/โปรแกรม') {
      messages = [createScheduleMenuFlex()];
    } else if (command === '/ตารางคะแนน') {
      messages = createStandingsFlexMessages(fetchStandings());
    } else if (command.indexOf('/ตารางคะแนนชุด ') === 0) {
      var standingRange = Number(command.replace('/ตารางคะแนนชุด ', '').trim());
      messages = [createStandingsRangeFlexMessage(fetchStandings(), standingRange)];
    } else if (command === '/เมนูกลุ่ม') {
      messages = [createGroupSelectMenuFlex()];
    } else if (command.indexOf('/กลุ่ม ') === 0) {
      var groupName = command.replace('/กลุ่ม ', '').trim().toUpperCase();
      messages = [createGroupStandingFlex(groupName, getGroupStandingData(groupName))];
    } else if (command === '/knockout') {
      messages = [createKnockoutMenuFlex()];
    } else if (command.indexOf('/รอบ ') === 0) {
      var stageName = command.replace('/รอบ ', '').trim();
      messages = createKnockoutStageFlexMessages(fetchMatchesByStage(stageName), stageDisplayName_(stageName));
    } else if (command === '/ผลการแข่งขัน') {
      messages = createAllResultsFlexMessages(fetchAllResults());
    } else if (command === '/ผลบอล') {
      messages = [createResultsFlex(fetchResults())];
    } else if (command === '/help' || command === 'help') {
      messages = [createHelpFlex()];
    } else {
      messages = [
        createErrorFlex('ไม่พบคำสั่งนี้ ลองพิมพ์ /help เพื่อดูคำสั่งทั้งหมด'),
        createHelpFlex()
      ];
    }

    if (command !== '/help' && command !== 'help') {
      messages = appendCommandMenuAfterResponse_(messages);
    }

    replyMessage(replyToken, messages);
    writeLog('INFO', 'Handled command', { command: command });
  } catch (error) {
    writeLog('ERROR', 'handleTextCommand failed', serializeError(error));
    replyMessage(replyToken, [createErrorFlex(error.message || 'เกิดข้อผิดพลาด')]);
  }
}

function appendCommandMenuAfterResponse_(messages) {
  var safeMessages = messages || [];
  if (safeMessages.length >= 5) {
    safeMessages = safeMessages.slice(0, 4);
  }
  return safeMessages;
}

function replyMessage(replyToken, messages) {
  try {
    var token = getConfig('LINE_CHANNEL_ACCESS_TOKEN');
    if (!token) {
      throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN in settings sheet');
    }

    var payload = {
      replyToken: replyToken,
      messages: attachGlobalQuickReply_(logOutgoingPayloadSizes_(messages))
    };

    return callLineApi(LINE_REPLY_ENDPOINT, token, payload);
  } catch (error) {
    writeLog('ERROR', 'replyMessage failed', serializeError(error));
    throw error;
  }
}

function attachGlobalQuickReply_(messages) {
  if (!messages || !messages.length) {
    return messages;
  }

  var quickReply = {
    items: [
      createQuickReplyItem_('/today', 'Today'),
      createQuickReplyItem_('/tomorrow', 'Tomorrow'),
      createQuickReplyItem_('/schedule', 'Schedule'),
      createQuickReplyItem_('/standings', 'Standings'),
      createQuickReplyItem_('/standings1', 'A-C'),
      createQuickReplyItem_('/standings2', 'D-F'),
      createQuickReplyItem_('/standings3', 'G-I'),
      createQuickReplyItem_('/standings4', 'J-L'),
      createQuickReplyItem_('/groups', 'Groups'),
      createQuickReplyItem_('/knockout', 'Knockout'),
      createQuickReplyItem_('/results', 'Results'),
      createQuickReplyItem_('/allresults', 'All Results'),
      createQuickReplyItem_('/help', 'Menu')
    ]
  };

  messages[messages.length - 1].quickReply = quickReply;
  return messages;
}

function logOutgoingPayloadSizes_(messages) {
  (messages || []).forEach(function(message) {
    if (message && message.type === 'flex') {
      try {
        console.log('Flex payload size KB:', getPayloadSizeKb(message));
      } catch (error) {
        console.log('Flex payload size check failed:', error && error.message);
      }
    }
  });
  return messages;
}

function createQuickReplyItem_(text, label) {
  return {
    type: 'action',
    action: {
      type: 'message',
      label: label,
      text: text
    }
  };
}

function pushMessage(to, messages) {
  try {
    var token = getConfig('LINE_CHANNEL_ACCESS_TOKEN');
    var targetId = to || getConfig('LINE_PUSH_TARGET_ID');
    if (!token) {
      throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN in settings sheet');
    }
    if (!targetId) {
      throw new Error('Missing LINE_PUSH_TARGET_ID in settings sheet');
    }

    var payload = {
      to: targetId,
      messages: messages
    };

    return callLineApi(LINE_PUSH_ENDPOINT, token, payload);
  } catch (error) {
    writeLog('ERROR', 'pushMessage failed', serializeError(error));
    throw error;
  }
}

function getConfig(key) {
  try {
    return getConfigMap_()[key] || '';
  } catch (error) {
    writeLog('ERROR', 'getConfig failed for ' + key, serializeError(error));
    return '';
  }
}

function getConfigMap_() {
  if (CONFIG_CACHE_) {
    return CONFIG_CACHE_;
  }

  CONFIG_CACHE_ = {};
  var sheet = getSheetByName_('settings');
  if (!sheet || sheet.getLastRow() < 2) {
    return CONFIG_CACHE_;
  }

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    var key = String(values[i][0] || '').trim();
    if (key) {
      CONFIG_CACHE_[key] = String(values[i][1] || '').trim();
    }
  }
  return CONFIG_CACHE_;
}

function writeLog(type, message, data) {
  try {
    if (type === 'INFO') {
      return;
    }
    appendLog([
      new Date(),
      type,
      message,
      JSON.stringify(data || {})
    ]);
  } catch (error) {
    console.error('writeLog failed', error);
  }
}

function callLineApi(url, token, payload) {
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  var body = response.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('LINE API error ' + code + ': ' + body);
  }

  return body ? JSON.parse(body) : {};
}

function normalizeCommand(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function resolveCommand_(text) {
  var raw = normalizeCommand(text);
  var command = raw.toLowerCase();
  var compact = command.replace(/\s+/g, '');

  if (command === '/today' || command === '/วันนี้' || command === 'วันนี้' || command === 'today') {
    return '/วันนี้';
  }
  if (
    command === '/tomorrow' ||
    command === '/พรุ่งนี้' ||
    command === 'พรุ่งนี้' ||
    command === 'พรุ้งนี้' ||
    command === 'พน' ||
    command === 'tomorrow' ||
    command === 'tmr' ||
    compact === 'พรุ่งนี้' ||
    compact === 'พรุ้งนี้' ||
    compact === 'พน'
  ) {
    return '/พรุ่งนี้';
  }
  if (
    command === '/schedule' ||
    command === '/โปรแกรม' ||
    command === 'โปรแกรม' ||
    command === 'โปรแกรมแข่ง' ||
    command === 'แข่ง' ||
    command === 'ทั้งหมด' ||
    command === 'ดูทั้งหมด' ||
    command === 'schedule' ||
    command === 'all'
  ) {
    return '/โปรแกรม';
  }

  var scheduleGroupMatch = compact.match(/^\/?schedule([a-l])$/i) || compact.match(/^\/?matches([a-l])$/i) || compact.match(/^\/?โปรแกรมกลุ่ม([a-l])$/i);
  if (scheduleGroupMatch) {
    return '/โปรแกรมกลุ่ม ' + scheduleGroupMatch[1].toUpperCase();
  }
  if (command === '/ตารางคะแนน' || command === 'ตารางคะแนน' || command === 'ตาราง' || command === 'คะแนน' || command === '/ตารางคะแนนทุกกลุ่ม' || command === 'ตารางคะแนนทุกกลุ่ม') {
    return '/ตารางคะแนน';
  }
  if (command === '/standings') {
    return '/ตารางคะแนน';
  }
  if (command === '/standings1') {
    return '/ตารางคะแนนชุด 1';
  }
  if (command === '/standings2') {
    return '/ตารางคะแนนชุด 2';
  }
  if (command === '/standings3') {
    return '/ตารางคะแนนชุด 3';
  }
  if (command === '/standings4') {
    return '/ตารางคะแนนชุด 4';
  }
  if (command === '/groups' || command === '/group' || command === 'groups' || command === 'group' || command === 'กลุ่ม' || command === 'เลือกกลุ่ม') {
    return '/เมนูกลุ่ม';
  }
  if (command === '/groupstage' || command === 'group stage') {
    return '/โปรแกรมรอบแบ่งกลุ่ม';
  }
  if (command === '/knockout' || command === 'knockout') {
    return '/knockout';
  }
  if (command === '/round32') {
    return '/รอบ ROUND_OF_32';
  }
  if (command === '/round16') {
    return '/รอบ ROUND_OF_16';
  }
  if (command === '/quarter') {
    return '/รอบ QUARTER_FINALS';
  }
  if (command === '/semi') {
    return '/รอบ SEMI_FINALS';
  }
  if (command === '/third') {
    return '/รอบ THIRD_PLACE';
  }
  if (command === '/final') {
    return '/รอบ FINAL';
  }
  if (command === '/results' || command === '/ผลบอล' || command === 'ผลบอล' || command === 'ผล' || command === 'บอล' || command === 'results') {
    return '/ผลบอล';
  }
  if (
    command === '/allresults' ||
    command === '/all-results' ||
    command === '/ผลการแข่งขัน' ||
    command === 'ผลการแข่งขัน' ||
    command === 'ผลทั้งหมด' ||
    command === 'ผลบอลทั้งหมด' ||
    command === 'ดูผลทั้งหมด' ||
    command === 'all results'
  ) {
    return '/ผลการแข่งขัน';
  }
  if (command === '/help' || command === 'help' || command === 'ช่วย' || command === '?' || command === 'เมนู') {
    return '/help';
  }
  if (
    command === '/ข้อมูลจริง' ||
    command === '/live' ||
    command === 'ข้อมูลจริง' ||
    command === 'ใช้ข้อมูลจริง' ||
    command === 'live' ||
    command === 'golive' ||
    command === 'go live'
  ) {
    return '/ข้อมูลจริง';
  }

  var groupMatch = compact.match(/^\/?กลุ่ม([a-l])$/i) || compact.match(/^\/?group([a-l])$/i);
  if (groupMatch) {
    return '/กลุ่ม ' + groupMatch[1].toUpperCase();
  }

  var slashGroupMatch = compact.match(/^\/([a-l])$/i);
  if (slashGroupMatch) {
    return '/กลุ่ม ' + slashGroupMatch[1].toUpperCase();
  }

  if (/^[a-l]$/i.test(compact)) {
    return '/กลุ่ม ' + compact.toUpperCase();
  }

  return raw;
}

function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function serializeError(error) {
  return {
    name: error && error.name,
    message: error && error.message,
    stack: error && error.stack
  };
}
