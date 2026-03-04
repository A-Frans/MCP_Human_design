/**
 * Human Design Calculations
 * Модуль для расчета карты Human Design
 */

// Импорт для расчета позиций планет
import * as Swisseph from 'swisseph';

// Примечание: Для работы с CommonJS модулем swisseph может потребоваться динамический импорт
// или использование require в CommonJS контексте

// 64 ворот (gates) в Human Design
const GATES = {
  // Создание/Творчество/Формы
  1: { name: 'The Creative', house: 1, line: 6 },
  // Питание/Взаимодействие
  2: { name: 'The Receptive', house: 1, line: 6 },
  // Образование/Начало
  3: { name: 'Ordering', house: 1, line: 6 },
  // Формирование/Решение
  4: { name: 'Formulization', house: 1, line: 6 },
  // Время/Ожидание
  5: { name: 'Needing', house: 1, line: 6 },
  // Конфликт/Приспособление
  6: { name: 'Friction', house: 1, line: 6 },
  // Армейское управление/Роль
  7: { name: 'The Role of Self', house: 1, line: 6 },
  // Сдерживание/Вклад
  8: { name: 'Holding Together', house: 1, line: 6 },
  // Сосредоточение/Детали
  9: { name: 'The Focus', house: 1, line: 6 },
  // Поведение/Кризис
  10: { name: 'The Treading', house: 1, line: 6 },
  // Идеи/Мир
  11: { name: 'Ideas', house: 1, line: 6 },
  // Привязанность/Устойчивость
  12: { name: 'Caution', house: 1, line: 6 },
  // Слушатель/Сообщества
  13: { name: 'The Listener', house: 1, line: 6 },
  // Могущество/Навыки
  14: { name: 'Power Skills', house: 1, line: 6 },
  // Смирение/Экстремизм
  15: { name: 'Modesty', house: 1, line: 6 },
  // Энтузиазм/Навыки
  16: { name: 'Skills', house: 1, line: 6 },
  // Мнение/Следование
  17: { name: 'Following', house: 1, line: 6 },
  // Корректировка/Работа
  18: { name: 'Work', house: 1, line: 6 },
  // Желание/Сближение
  19: { name: 'Approach', house: 1, line: 6 },
  // Присутствие/Сейчас
  20: { name: 'Now', house: 1, line: 6 },
  // Контроль/Редактор
  21: { name: 'The Editor', house: 1, line: 6 },
  // Грация/Открытость
  22: { name: 'Openness', house: 1, line: 6 },
  // Ассимиляция/Разделение
  23: { name: 'Splitting Apart', house: 1, line: 6 },
  // Возвращение/Рационализация
  24: { name: 'Rationalizing', house: 1, line: 6 },
  // Невинность/Дух
  25: { name: 'Spirit of the Self', house: 1, line: 6 },
  // Эгоистический/Передача транса
  26: { name: 'The Transmitter', house: 1, line: 6 },
  // Заботливость/Кормление
  27: { name: 'Caring', house: 1, line: 6 },
  // Игрок/Преодоление
  28: { name: 'The Game Player', house: 1, line: 6 },
  // Сказать да/Обязательства
  29: { name: 'Saying Yes', house: 1, line: 6 },
  // Чувства/Распознавание
  30: { name: 'Recognition of Feelings', house: 1, line: 6 },
  // Притягательная сила/Лидерство
  31: { name: 'Influence', house: 1, line: 6 },
  // Продолжительность/Редкость
  32: { name: 'The Duration', house: 1, line: 6 },
  // Скрытность/Отступление
  33: { name: 'Retreat', house: 1, line: 6 },
  // Могущество/Большой вклад
  34: { name: 'Great Power', house: 1, line: 6 },
  // Изменение/Прогресс
  35: { name: 'Progress', house: 1, line: 6 },
  // Несоответствие/Кризис
  36: { name: 'Crisis', house: 1, line: 6 },
  // Семья/Равенство
  37: { name: 'Friendship', house: 1, line: 6 },
  // Воин/Сражение
  38: { name: 'The Fighter', house: 1, line: 6 },
  // Возбудитель/Противодействие
  39: { name: 'Provocation', house: 1, line: 6 },
  // Необходимость/Работа
  40: { name: 'Deliverance', house: 1, line: 6 },
  // Желание/Сжатие
  41: { name: 'Contraction', house: 1, line: 6 },
  // Рост/Увеличение
  42: { name: 'Growth', house: 1, line: 6 },
  // Прозрение/Различение
  43: { name: 'Insight', house: 1, line: 6 },
  // Встреча/Подход
  44: { name: 'Coming to Meet', house: 1, line: 6 },
  // Собрание/Король
  45: { name: 'The Gatherer', house: 1, line: 6 },
  // Восхождение на холм/Определение
  46: { name: 'Determination', house: 1, line: 6 },
  // Понимание/Реализация
  47: { name: 'Realization', house: 1, line: 6 },
  // Источник/Колодец
  48: { name: 'The Well', house: 1, line: 6 },
  // Революция/Принципы
  49: { name: 'Revolution', house: 1, line: 6 },
  // Огонь/Ценности
  50: { name: 'Values', house: 1, line: 6 },
  // Возбуждение/Инициатива
  51: { name: 'The Arousing', house: 1, line: 6 },
  // Остановка/Накопление
  52: { name: 'Keeping Still', house: 1, line: 6 },
  // Развитие/Порядок
  53: { name: 'Development', house: 1, line: 6 },
  // Верность/Невестка
  54: { name: 'The Marrying Maiden', house: 1, line: 6 },
  // Избыток/Изобилие
  55: { name: 'Abundance', house: 1, line: 6 },
  // Странник/Путешествие
  56: { name: 'The Wanderer', house: 1, line: 6 },
  // Нежный/Проникновение
  57: { name: 'The Gentle', house: 1, line: 6 },
  // Источник удовольствия/Радость
  58: { name: 'The Joyous', house: 1, line: 6 },
  // Разделение/Сближение
  59: { name: 'Dispersion', house: 1, line: 6 },
  // Ограничение/Распределение
  60: { name: 'Limitation', house: 1, line: 6 },
  // Внутренняя правда/Центральность
  61: { name: 'Inner Truth', house: 1, line: 6 },
  // Малая экспансия/Детали
  62: { name: 'Detail', house: 1, line: 6 },
  // После завершения/Завершение
  63: { name: 'After Completion', house: 1, line: 6 },
  // До завершения/Не до конца
  64: { name: 'Before Completion', house: 1, line: 6 },
};

// 36 каналов в Human Design
const CHANNELS = {
  '1-8': { name: 'Channel of Inspiration', centers: [1, 8] },
  '2-14': { name: 'Channel of The Beat', centers: [2, 14] },
  '3-60': { name: 'Channel of Mutation', centers: [3, 60] },
  '4-63': { name: 'Channel of Logic', centers: [4, 63] },
  '5-15': { name: 'Channel of Rhythm', centers: [5, 15] },
  '6-59': { name: 'Channel of Mating', centers: [6, 59] },
  '7-31': { name: 'Channel of The Alpha', centers: [7, 31] },
  '9-52': { name: 'Channel of Determination', centers: [9, 52] },
  '10-20': { name: 'Channel of Awakening', centers: [10, 20] },
  '10-34': { name: 'Channel of Exploration', centers: [10, 34] },
  '10-57': { name: 'Channel of Perfected Form', centers: [10, 57] },
  '11-56': { name: 'Channel of Curiosity', centers: [11, 56] },
  '12-22': { name: 'Channel of Openness', centers: [12, 22] },
  '13-33': { name: 'Channel of The Prodigal', centers: [13, 33] },
  '16-48': { name: 'Channel of The Wavelength', centers: [16, 48] },
  '17-62': { name: 'Channel of Acceptance', centers: [17, 62] },
  '18-58': { name: 'Channel of Judgement', centers: [18, 58] },
  '19-49': { name: 'Channel of Synthesis', centers: [19, 49] },
  '20-34': { name: 'Channel of Charisma', centers: [20, 34] },
  '20-57': { name: 'Channel of The Brain Wave', centers: [20, 57] },
  '21-45': { name: 'Channel of Money', centers: [21, 45] },
  '23-43': { name: 'Channel of Structuring', centers: [23, 43] },
  '24-61': { name: 'Channel of Awareness', centers: [24, 61] },
  '25-51': { name: 'Channel of Initiation', centers: [25, 51] },
  '26-44': { name: 'Channel of Surrender', centers: [26, 44] },
  '27-50': { name: 'Channel of Preservation', centers: [27, 50] },
  '28-38': { name: 'Channel of Struggle', centers: [28, 38] },
  '29-46': { name: 'Channel of Discovery', centers: [29, 46] },
  '30-41': { name: 'Channel of Recognition', centers: [30, 41] },
  '32-54': { name: 'Channel of Transformation', centers: [32, 54] },
  '34-57': { name: 'Channel of Power', centers: [34, 57] },
  '35-36': { name: 'Channel of Transitoriness', centers: [35, 36] },
  '37-40': { name: 'Channel of Community', centers: [37, 40] },
  '39-55': { name: 'Channel of Emoting', centers: [39, 55] },
  '42-53': { name: 'Channel of Maturation', centers: [42, 53] },
  '47-64': { name: 'Channel of Abstraction', centers: [47, 64] },
};

// 9 центров Human Design
const CENTERS = {
  1: { name: 'Root Center', type: 'pressure', color: '#FF6B6B' },
  2: { name: 'Sacral Center', type: 'motor', color: '#FF9F43' },
  3: { name: 'Solar Plexus Center', type: 'motor', color: '#FFD93D' },
  4: { name: 'Heart Center', type: 'motor', color: '#6BCF7F' },
  5: { name: 'Throat Center', type: 'output', color: '#4ECDC4' },
  6: { name: 'Ajna Center', type: 'awareness', color: '#45B7D1' },
  7: { name: 'Head Center', type: 'pressure', color: '#96CEB4' },
  8: { name: 'Spleen Center', type: 'awareness', color: '#FFEAA7' },
  9: { name: 'G Center', type: 'identity', color: '#DDA0DD' },
};

/**
 * Рассчитывает позицию планеты в Human Design
 * @param {number} jd - Юлианская дата
 * @param {string} planetName - Название планеты
 * @returns {Object} Позиция планеты с воротами и линией
 */
function sweJulday(year, month, day, hourDecimal) {
  return new Promise((resolve, reject) => {
    // Gregorian calendar
    const cal = Swisseph.SE_GREG_CAL ?? 1;
    Swisseph.swe_julday(year, month, day, hourDecimal, cal, (jd) => {
      if (typeof jd !== 'number') return reject(new Error('Invalid Julian Day'));
      resolve(jd);
    });
  });
}

function sweCalcUt(jd, planetIndex) {
  return new Promise((resolve, reject) => {
    const flags = Swisseph.SEFLG_SPEED ?? 256;
    Swisseph.swe_calc_ut(jd, planetIndex, flags, (res) => {
      if (!res) return reject(new Error('swe_calc_ut returned empty result'));
      if (res.error) return reject(new Error(res.error));
      resolve(res);
    });
  });
}
async function calculatePlanetPosition(jd, planetName) {
  try {
    const planetIndex = getPlanetIndex(planetName);
    const position = await sweCalcUt(jd, planetIndex);

    // swisseph geeft vaak een array terug in position.longitude of position[0]
    const longitude =
      typeof position.longitude === 'number'
        ? position.longitude
        : Array.isArray(position.longitude)
          ? position.longitude[0]
          : Array.isArray(position)
            ? position[0]
            : position?.xx?.[0];

    if (typeof longitude !== 'number') {
      throw new Error('Longitude not found in swisseph response');
    }
    
    // Human Design использует тропический зодиак (не сидерический)
    const sign = Math.floor(longitude / 30) + 1;
    const degree = longitude % 30;
    
    // Каждый знак делится на 6 ворот (по 5.33 градуса каждое)
    // В Human Design всего 64 ворот (не 72!)
    const gateInSign = Math.floor(degree / 5.625) + 1; // 360/64 = 5.625
    const gate = (sign - 1) * 2 + gateInSign;
    
    // Линия определяется по остатку от деления градуса внутри ворот
    const degreeInGate = degree % 5.625;
    const line = Math.floor(degreeInGate / 0.9375) + 1; // 5.625/6 = 0.9375
    
    return {
      name: planetName,
      longitude: longitude,
      sign: sign,
      gate: gate,
      line: line,
      gateName: GATES[gate]?.name || 'Unknown',
    };
  } catch (error) {
    console.error(`Error calculating ${planetName}:`, error);
    return null;
  }
}

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
 * Основная функция расчета Human Design карты
 */
export async function calculateHumanDesign({
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
    
    // Конвертация в Юлианскую дату
    const jd = await sweJulday(year, month, day, hour + minute / 60); // Gregorian calendar
    
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
    
const planetPositions = (await Promise.all(
  planets.map(planet => calculatePlanetPosition(jd, planet))
)).filter(p => p !== null);
    
    // Определение ворот (активных)
    const gates = planetPositions.map(p => ({
      number: p.gate,
      name: p.gateName,
      line: p.line,
      planet: p.name,
    }));
    
    // Определение типа
    const type = determineType(gates);
    
    // Определение профиля
    const profile = determineProfile(planetPositions);
    
    // Определение авторитета
    const authority = determineAuthority(planetPositions);
    
    // Определение стратегии
    const strategy = determineStrategy(type);
    
    // Определение определенных центров
    const definedCenters = getDefinedCenters(gates);
    
    return {
      birthDate,
      birthTime,
      birthLocation,
      type,
      strategy,
      authority,
      profile,
      gates,
      definedCenters,
      planetPositions: planetPositions.map(p => ({
        planet: p.name,
        sign: p.sign,
        gate: p.gate,
        line: p.line,
      })),
      incarnationCross: determineIncarnationCross(planetPositions),
    };
  } catch (error) {
    console.error('Error calculating Human Design:', error);
    throw new Error(`Failed to calculate Human Design: ${error.message}`);
  }
}

/**
 * Определение типа Human Design
 */
function determineType(gates) {
  // Это упрощенная версия - в реальности нужно проверять определенные центры
  const definedGates = gates.map(g => g.number);
  
  // Проверка наличия определенных центров через ворота
  const sacralGates = [2, 7, 10, 13, 15, 16, 21, 27, 44, 48, 50, 51, 56, 59, 62];
  const throatGates = [2, 3, 5, 7, 10, 11, 12, 16, 17, 20, 21, 22, 23, 24, 28, 31, 33, 45, 56, 62];
  const solarPlexusGates = [20, 25, 30, 34, 35, 36, 37, 38, 39, 40, 41, 55];
  
  const hasSacral = sacralGates.some(g => definedGates.includes(g));
  const hasThroat = throatGates.some(g => definedGates.includes(g));
  const hasSolarPlexus = solarPlexusGates.some(g => definedGates.includes(g));
  
  if (hasSacral && hasThroat) {
    return {
      name: 'Manifesting Generator',
      description: 'Манифестирующий Генератор',
    };
  }
  
  if (hasSacral) {
    return {
      name: 'Generator',
      description: 'Генератор',
    };
  }
  
  if (!hasThroat) {
    return {
      name: 'Reflector',
      description: 'Рефлектор',
    };
  }
  
  if (hasSolarPlexus) {
    return {
      name: 'Projector',
      description: 'Проектор',
    };
  }
  
  return {
    name: 'Manifestor',
    description: 'Манифестор',
  };
}

/**
 * Определение профиля
 */
function determineProfile(planetPositions) {
  // Профиль определяется линией Солнца и Земли
  const sun = planetPositions.find(p => p.name === 'Sun');
  const earth = planetPositions.find(p => p.name === 'Earth') || planetPositions.find(p => p.name === 'Sun'); // Земля противоположна Солнцу
  
  if (!sun) return null;
  
  const sunLine = sun.line;
  const earthLine = 6 - sunLine; // Earth is opposite to Sun
  
  return {
    number: `${sunLine}/${earthLine}`,
    description: `Профиль ${sunLine}/${earthLine}`,
  };
}

/**
 * Определение авторитета
 */
function determineAuthority(planetPositions) {
  const solarPlexusGates = [20, 25, 30, 34, 35, 36, 37, 38, 39, 40, 41, 55];
  const sacralGates = [2, 7, 10, 13, 15, 16, 21, 27, 44, 48, 50, 51, 56, 59, 62];
  const splenicGates = [18, 26, 44, 45, 48, 57, 58];
  const egoGates = [21, 26, 40, 51];
  const gGates = [1, 2, 7, 10, 13, 15, 25, 46];
  
  const gates = planetPositions.map(p => p.gate);
  
  if (solarPlexusGates.some(g => gates.includes(g))) {
    return {
      name: 'Emotional',
      description: 'Эмоциональная авторитет',
    };
  }
  
  if (sacralGates.some(g => gates.includes(g))) {
    return {
      name: 'Sacral',
      description: 'Сакральная авторитет',
    };
  }
  
  if (splenicGates.some(g => gates.includes(g))) {
    return {
      name: 'Splenic',
      description: 'Селезеночная авторитет',
    };
  }
  
  if (egoGates.some(g => gates.includes(g))) {
    return {
      name: 'Ego Manifested',
      description: 'Проявленный Эго',
    };
  }
  
  if (gGates.some(g => gates.includes(g))) {
    return {
      name: 'G Center',
      description: 'G-Центр авторитет',
    };
  }
  
  return {
    name: 'No Inner Authority',
    description: 'Без внутренней власти',
  };
}

/**
 * Определение стратегии
 */
function determineStrategy(type) {
  const strategies = {
    'Manifestor': 'Информировать',
    'Generator': 'Отвечать',
    'Manifesting Generator': 'Отвечать и информировать',
    'Projector': 'Ждать приглашения',
    'Reflector': 'Ждать полного лунного цикла',
  };
  
  return strategies[type.name] || 'Отвечать';
}

/**
 * Получить определенные центры
 */
function getDefinedCenters(gates) {
  const gateNumbers = gates.map(g => g.number);
  
  // Маппинг ворот к центрам (упрощенно)
  const centerGates = {
    1: [1, 7, 13, 17, 21, 25, 26, 30, 38, 51, 57, 61, 63],
    2: [2, 27, 36, 42, 52],
    3: [37, 38, 39, 40, 41, 55],
    4: [21, 26, 40, 51],
    5: [2, 3, 5, 7, 10, 11, 12, 16, 17, 20, 21, 22, 23, 24, 28, 31, 33, 45, 56, 62],
    6: [9, 24, 43, 47, 61],
    7: [11, 23, 43, 47, 64, 61],
    8: [44, 45, 46, 50],
    9: [1, 2, 7, 10, 13, 15, 25, 46],
  };
  
  const defined = [];
  
  for (const [center, gates] of Object.entries(centerGates)) {
    if (gates.some(g => gateNumbers.includes(g))) {
      defined.push({
        number: parseInt(center),
        name: CENTERS[center]?.name || 'Unknown',
      });
    }
  }
  
  return defined;
}

/**
 * Определение Incarnation Cross
 */
function determineIncarnationCross(planetPositions) {
  const sun = planetPositions.find(p => p.name === 'Sun');
  const earth = planetPositions.find(p => p.name === 'Earth'); // Земля противоположна Солнцу
  
  if (!sun) return null;
  
  // Incarnation Cross определяется солнечной и земной позицией
  return {
    sunGate: sun.gate,
    earthGate: sun.gate, // Упрощенно
    cross: `Cross of ${sun.gate} / ${sun.gate}`,
  };
}

