/**
 * Human Design Calculations with Swiss Ephemeris (CommonJS version)
 * Модуль для точного расчета карты Human Design
 */

// Импорт для расчета позиций планет (CommonJS)
const swissephModule = require('swisseph');
const Swisseph = swissephModule.default || swissephModule;

// 64 ворот (gates) в Human Design с полными данными
const GATES = {
  1: { name: 'The Creative', ru_name: 'Творческий', hexagram: 1 },
  2: { name: 'The Receptive', ru_name: 'Воспринимающий', hexagram: 2 },
  3: { name: 'Ordering', ru_name: 'Порядок', hexagram: 3 },
  4: { name: 'Formulization', ru_name: 'Формулирование', hexagram: 4 },
  5: { name: 'Needing', ru_name: 'Потребность', hexagram: 5 },
  6: { name: 'Friction', ru_name: 'Трение', hexagram: 6 },
  7: { name: 'The Role of Self', ru_name: 'Роль Я', hexagram: 7 },
  8: { name: 'Holding Together', ru_name: 'Удержание вместе', hexagram: 8 },
  9: { name: 'The Focus', ru_name: 'Фокус', hexagram: 9 },
  10: { name: 'The Treading', ru_name: 'Шаги', hexagram: 10 },
  11: { name: 'Ideas', ru_name: 'Идеи', hexagram: 11 },
  12: { name: 'Caution', ru_name: 'Осторожность', hexagram: 12 },
  13: { name: 'The Listener', ru_name: 'Слушатель', hexagram: 13 },
  14: { name: 'Power Skills', ru_name: 'Силовые навыки', hexagram: 14 },
  15: { name: 'Modesty', ru_name: 'Скромность', hexagram: 15 },
  16: { name: 'Skills', ru_name: 'Навыки', hexagram: 16 },
  17: { name: 'Following', ru_name: 'Следование', hexagram: 17 },
  18: { name: 'Work', ru_name: 'Работа', hexagram: 18 },
  19: { name: 'Approach', ru_name: 'Подход', hexagram: 19 },
  20: { name: 'Now', ru_name: 'Сейчас', hexagram: 20 },
  21: { name: 'The Editor', ru_name: 'Редактор', hexagram: 21 },
  22: { name: 'Openness', ru_name: 'Открытость', hexagram: 22 },
  23: { name: 'Splitting Apart', ru_name: 'Распад', hexagram: 23 },
  24: { name: 'Rationalizing', ru_name: 'Рационализация', hexagram: 24 },
  25: { name: 'Spirit of the Self', ru_name: 'Дух Я', hexagram: 25 },
  26: { name: 'The Transmitter', ru_name: 'Передатчик', hexagram: 26 },
  27: { name: 'Caring', ru_name: 'Забота', hexagram: 27 },
  28: { name: 'The Game Player', ru_name: 'Игрок', hexagram: 28 },
  29: { name: 'Saying Yes', ru_name: 'Говорить да', hexagram: 29 },
  30: { name: 'Recognition of Feelings', ru_name: 'Узнавание чувств', hexagram: 30 },
  31: { name: 'Influence', ru_name: 'Влияние', hexagram: 31 },
  32: { name: 'The Duration', ru_name: 'Продолжительность', hexagram: 32 },
  33: { name: 'Retreat', ru_name: 'Отступление', hexagram: 33 },
  34: { name: 'Great Power', ru_name: 'Большая сила', hexagram: 34 },
  35: { name: 'Progress', ru_name: 'Прогресс', hexagram: 35 },
  36: { name: 'Crisis', ru_name: 'Кризис', hexagram: 36 },
  37: { name: 'Friendship', ru_name: 'Дружба', hexagram: 37 },
  38: { name: 'The Fighter', ru_name: 'Боец', hexagram: 38 },
  39: { name: 'Provocation', ru_name: 'Провокация', hexagram: 39 },
  40: { name: 'Deliverance', ru_name: 'Освобождение', hexagram: 40 },
  41: { name: 'Contraction', ru_name: 'Сокращение', hexagram: 41 },
  42: { name: 'Growth', ru_name: 'Рост', hexagram: 42 },
  43: { name: 'Insight', ru_name: 'Инсайт', hexagram: 43 },
  44: { name: 'Coming to Meet', ru_name: 'Встреча', hexagram: 44 },
  45: { name: 'The Gatherer', ru_name: 'Собирающий', hexagram: 45 },
  46: { name: 'Determination', ru_name: 'Определенность', hexagram: 46 },
  47: { name: 'Realization', ru_name: 'Реализация', hexagram: 47 },
  48: { name: 'The Well', ru_name: 'Колодец', hexagram: 48 },
  49: { name: 'Revolution', ru_name: 'Революция', hexagram: 49 },
  50: { name: 'Values', ru_name: 'Ценности', hexagram: 50 },
  51: { name: 'The Arousing', ru_name: 'Побуждение', hexagram: 51 },
  52: { name: 'Keeping Still', ru_name: 'Сохранение покоя', hexagram: 52 },
  53: { name: 'Development', ru_name: 'Развитие', hexagram: 53 },
  54: { name: 'The Marrying Maiden', ru_name: 'Невеста', hexagram: 54 },
  55: { name: 'Abundance', ru_name: 'Изобилие', hexagram: 55 },
  56: { name: 'The Wanderer', ru_name: 'Странник', hexagram: 56 },
  57: { name: 'The Gentle', ru_name: 'Нежный', hexagram: 57 },
  58: { name: 'The Joyous', ru_name: 'Радостный', hexagram: 58 },
  59: { name: 'Dispersion', ru_name: 'Дисперсия', hexagram: 59 },
  60: { name: 'Limitation', ru_name: 'Ограничение', hexagram: 60 },
  61: { name: 'Inner Truth', ru_name: 'Внутренняя правда', hexagram: 61 },
  62: { name: 'Detail', ru_name: 'Деталь', hexagram: 62 },
  63: { name: 'After Completion', ru_name: 'После завершения', hexagram: 63 },
  64: { name: 'Before Completion', ru_name: 'До завершения', hexagram: 64 },
};

// Центры и их ворота
const CENTER_GATES = {
  Root: [19, 39, 52, 58],
  Sacral: [2, 14, 26, 30, 31, 38, 42, 45, 59],
  SolarPlexus: [10, 20, 29, 34, 40, 46, 50, 57],
  Heart: [10, 21, 26, 34, 40, 51],
  Throat: [2, 3, 5, 7, 10, 11, 12, 16, 17, 20, 21, 22, 23, 24, 28, 31, 33, 35, 45, 56, 62],
  Ajna: [9, 20, 23, 30, 34, 40, 43, 47, 60, 61, 63, 64],
  Head: [1, 7, 13, 26, 27, 44, 50, 64],
  Spleen: [28, 32, 44, 48, 50, 57, 58],
  GCenter: [1, 2, 7, 10, 13, 15, 25, 46],
};

/**
 * Получить индекс планеты для Swiss Ephemeris
 */
function getPlanetIndex(planetName) {
  const planetMap = {
    'Sun': 0,
    'Moon': 1,
    'Mercury': 3,
    'Venus': 4,
    'Mars': 2,
    'Jupiter': 5,
    'Saturn': 6,
    'Rahu': 11, // North Node
    'Ketu': 12, // South Node
  };
  return planetMap[planetName] || 0;
}

/**
 * Рассчитывает позицию планеты в Human Design используя Swiss Ephemeris
 */
function calculatePlanetPosition(jd, planetName) {
  try {
    const planetIndex = getPlanetIndex(planetName);
    
    // Используем Swiss Ephemeris для расчета
    const position = Swisseph.calc_ut(jd, planetIndex);
    const longitude = position.longitude;
    
    // Human Design использует тропический зодиак
    const sign = Math.floor(longitude / 30) + 1;
    const degree = longitude % 30;
    
    // Правильный расчет ворот Human Design
    // 64 ворот распределены по всем знакам
    // Каждое ворота занимает 360/64 = 5.625 градусов
    const gateNumber = Math.floor(longitude / 5.625) + 1;
    const gate = gateNumber > 64 ? 64 : gateNumber;
    
    // Линия (1-6) внутри ворот
    // Каждое ворота делится на 6 линий по 0.9375 градуса
    const degreeInGate = longitude % 5.625;
    const line = Math.floor(degreeInGate / 0.9375) + 1;
    
    return {
      name: planetName,
      longitude: longitude,
      sign: sign,
      gate: gate,
      line: line,
      gateInfo: GATES[gate] || { name: 'Unknown', ru_name: 'Неизвестно' },
      color: degreeInGate / 0.9375, // Точное положение в линии
    };
  } catch (error) {
    console.error(`Error calculating ${planetName}:`, error);
    return null;
  }
}

/**
 * Определение типа Human Design по определенным центрам
 */
function determineType(gates) {
  const gateNumbers = gates.map(g => g.gate);
  
  // Проверка определенности центров
  const hasSacral = CENTER_GATES.Sacral.some(g => gateNumbers.includes(g));
  const hasThroat = CENTER_GATES.Throat.some(g => gateNumbers.includes(g));
  const hasSolarPlexus = CENTER_GATES.SolarPlexus.some(g => gateNumbers.includes(g));
  const hasNone = gateNumbers.length === 0;
  
  // Определяем тип
  if (hasSacral && hasThroat) {
    return {
      name: 'Manifesting Generator',
      ru_name: 'Манифестирующий Генератор',
      description: 'Манифестирующие Генераторы - это Генераторы с возможностью инициировать. Они сочетают устойчивую жизненную силу Генератора с способностью Манифестора начинать действия.',
    };
  } else if (hasSacral) {
    return {
      name: 'Generator',
      ru_name: 'Генератор',
      description: 'Генераторы - это жизненная сила человечества. Их стратегия - отвечать на вопросы жизни и работы через сакральный отклик.',
    };
  } else if (!hasThroat) {
    return {
      name: 'Reflector',
      ru_name: 'Рефлектор',
      description: 'Рефлекторы отражают энергию окружающих людей и мест. Их стратегия - ждать полного лунного цикла для принятия важных решений.',
    };
  } else if (hasSolarPlexus) {
    return {
      name: 'Projector',
      ru_name: 'Проектор',
      description: 'Проекторы созданы для управления и направления энергией других. Их стратегия - ждать приглашения или признания.',
    };
  } else {
    return {
      name: 'Manifestor',
      ru_name: 'Манифестор',
      description: 'Манифесторы приходят в этот мир, чтобы инициировать и воздействовать на других. Их стратегия - информировать.',
    };
  }
}

/**
 * Определение профиля
 */
function determineProfile(planetPositions) {
  const sun = planetPositions.find(p => p.name === 'Sun');
  const earthIndex = planetPositions.findIndex(p => p.name === 'Sun');
  
  if (!sun) return null;
  
  const sunLine = sun.line;
  // Земля находится напротив Солнца (180 градусов разницы)
  // В упрощенной версии используем противоположную линию
  const earthLine = 7 - sunLine;
  
  return {
    sun_line: sunLine,
    earth_line: earthLine,
    number: `${sunLine}/${earthLine}`,
    description: `Профиль ${sunLine}/${earthLine} - Солнечная линия ${sunLine} / Земная линия ${earthLine}`,
  };
}

/**
 * Определение авторитета
 */
function determineAuthority(planetPositions) {
  const gateNumbers = planetPositions.map(p => p.gate);
  
  const solarPlexusGates = CENTER_GATES.SolarPlexus;
  const sacralGates = CENTER_GATES.Sacral;
  const splenicGates = CENTER_GATES.Spleen;
  const gGates = CENTER_GATES.GCenter;
  const heartGates = CENTER_GATES.Heart;
  
  if (solarPlexusGates.some(g => gateNumbers.includes(g))) {
    return {
      name: 'Emotional',
      ru_name: 'Эмоциональная',
      description: 'Ждите полного цикла эмоций, прежде чем принимать важные решения. Эмоции должны пройти все фазы.',
    };
  } else if (sacralGates.some(g => gateNumbers.includes(g))) {
    return {
      name: 'Sacral',
      ru_name: 'Сакральная',
      description: 'Слушайте звуки и ощущения вашего тела. Отклик приходит как "угу" или "не-угу".',
    };
  } else if (splenicGates.some(g => gateNumbers.includes(g))) {
    return {
      name: 'Splenic',
      ru_name: 'Селезеночная',
      description: 'Доверяйте первым импульсам и инстинктам. Авторитет действует мгновенно через интуицию.',
    };
  } else if (heartGates.some(g => gateNumbers.includes(g))) {
    return {
      name: 'Ego Manifested',
      ru_name: 'Проявленный Эго',
      description: 'Следуйте своим обещаниям и обязательствам. Не обещайте того, что не хотите выполнять.',
    };
  } else if (gGates.some(g => gateNumbers.includes(g))) {
    return {
      name: 'G Center',
      ru_name: 'G-центр',
      description: 'Следуйте направлению любви. Слушайте, куда вас влечет.',
    };
  } else if (planetPositions.length < 9) {
    return {
      name: 'Lunar',
      ru_name: 'Лунная',
      description: 'Ждите полного лунного цикла (28 дней) перед принятием важных решений.',
    };
  } else {
    return {
      name: 'No Inner Authority',
      ru_name: 'Без внутренней власти',
      description: 'Окружайте себя правильными людьми. Ваша власть - во внешнем окружении.',
    };
  }
}

/**
 * Получить определенные центры
 */
function getDefinedCenters(gates) {
  const gateNumbers = gates.map(g => g.gate);
  const defined = [];
  
  for (const [centerName, gates] of Object.entries(CENTER_GATES)) {
    const hasGate = gates.some(g => gateNumbers.includes(g));
    if (hasGate) {
      defined.push({
        name: centerName,
        defined: true,
      });
    }
  }
  
  return defined;
}

/**
 * Основная функция расчета Human Design карты с Swiss Ephemeris
 */
async function calculateHumanDesign({
  birthDate,
  birthTime,
  birthLocation,
  latitude,
  longitude,
}) {
  try {
    // Парсинг даты и времени
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    // Получить информацию о location и timezone
    const locationInfo = getLocationInfo(birthLocation);
    const utcOffset = getUTCOffset(birthLocation, birthDate);
    
    // Конвертация local time в UTC (с учетом DST)
    const utcData = convertToUTC(birthDate, birthTime, birthLocation);
    
    console.log(`Timezone: ${locationInfo.tz}, UTC offset: ${utcOffset}, DST considered`);
    console.log(`Local: ${birthTime} → UTC: ${utcData.utcHour}:${utcData.utcMinute}`);
    
    // Конвертация в Юлианскую дату (используем UTC время)
    const jd = Swisseph.julday(utcData.utcYear, utcData.utcMonth, utcData.utcDay, 
                                utcData.utcHour + utcData.utcMinute / 60, 1); // Gregorian calendar
    
    // Расчет позиций всех планет
    const planets = [
      'Sun',
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Rahu',
      'Ketu',
    ];
    
    const planetPositions = planets.map(planet => 
      calculatePlanetPosition(jd, planet)
    ).filter(p => p !== null);
    
    // Определение ворот (активных)
    const gates = planetPositions.map(p => ({
      number: p.gate,
      name: p.gateInfo.name,
      ru_name: p.gateInfo.ru_name,
      line: p.line,
      planet: p.name,
      sign: p.sign,
      hexagram: p.gateInfo.hexagram,
    }));
    
    // Определение типа
    const type = determineType(gates);
    
    // Определение профиля
    const profile = determineProfile(planetPositions);
    
    // Определение авторитета
    const authority = determineAuthority(planetPositions);
    
    // Определение стратегии
    const strategies = {
      'Manifestor': 'Информировать',
      'Generator': 'Отвечать',
      'Manifesting Generator': 'Отвечать и информировать',
      'Projector': 'Ждать приглашения',
      'Reflector': 'Ждать полного лунного цикла',
    };
    const strategy = strategies[type.name] || 'Отвечать';
    
    // Определение определенных центров
    const definedCenters = getDefinedCenters(gates);
    
    return {
      birthDate,
      birthTime,
      birthLocation,
      latitude: locationInfo.lat,
      longitude: locationInfo.lon,
      timezone: locationInfo.tz,
      utcOffset: utcOffset,
      type,
      strategy,
      authority,
      profile,
      gates,
      definedCenters,
      planetPositions: planetPositions.map(p => ({
        planet: p.name,
        longitude: p.longitude,
        sign: p.sign,
        gate: p.gate,
        line: p.line,
      })),
      calculationSource: 'Swiss Ephemeris',
      version: '1.0.0-full',
    };
  } catch (error) {
    console.error('Error calculating Human Design:', error);
    throw new Error(`Failed to calculate Human Design: ${error.message}`);
  }
}

// Экспорт для CommonJS
module.exports = {
  calculateHumanDesign,
  GATES,
  CENTER_GATES,
  // Экспортируем timezone utils для использования в других модулях
  getLocationInfo,
  getUTCOffset,
  convertToUTC,
};

