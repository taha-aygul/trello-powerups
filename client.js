const MARKS_KEY = 'marks';
const COMPACT_KEY = 'compact';

const MARKS = [
  { key: 'urgent', label: 'ACİL', color: 'red', icon: './icons/urgent.svg' },
  { key: 'bug', label: 'BUG', color: 'pink', icon: './icons/bug.svg' },
  { key: 'important', label: 'ÖNEMLİ', color: 'orange', icon: './icons/important.svg' },
  { key: 'mechanic', label: 'MECHANIC', color: 'blue', icon: './icons/mechanic.svg' },
  { key: 'levelDesign', label: 'LEVEL DESIGN', color: 'sky', icon: './icons/levelDesign.svg' },
  { key: 'qualityOfLife', label: 'QUALITY OF LIFE', color: 'lime', icon: './icons/qualityOfLife.svg' },
  { key: 'backend', label: 'BACKEND', color: 'sky', icon: './icons/backend.svg' },
  { key: 'art', label: 'ART', color: 'purple', icon: './icons/art.svg' },
  { key: 'performance', label: 'PERFORMANCE', color: 'yellow', icon: './icons/performance.svg' },
  { key: 'newFeature', label: 'NEW FEATURE', color: 'green', icon: './icons/newFeature.svg' },
  { key: 'niceToHave', label: 'NICE TO HAVE', color: 'light-gray', icon: './icons/niceToHave.svg' },
];

function readMarks(t) {
  return t.get('card', 'shared', MARKS_KEY, []);
}

function readCompact(t) {
  return t.get('member', 'private', COMPACT_KEY, false);
}

function activeMarks(keys) {
  return MARKS.filter(mark => keys.includes(mark.key));
}

function assetUrl(relativePath) {
  return new URL(relativePath, window.location.href).href;
}

function badgeFor(mark, compact) {
  if (compact) {
    return { icon: assetUrl(`./icons/dot-${mark.color}.svg`), monochrome: false };
  }
  return {
    text: mark.label,
    color: mark.color,
    icon: mark.icon ? assetUrl(mark.icon) : undefined,
    monochrome: false,
  };
}

async function toggleMark(t, key) {
  const keys = await readMarks(t);
  const next = keys.includes(key) ? keys.filter(item => item !== key) : [...keys, key];
  await t.set('card', 'shared', MARKS_KEY, next);
  return t.closePopup();
}

async function openMarkPopup(t) {
  const [keys, compact] = await Promise.all([readMarks(t), readCompact(t)]);
  return t.popup({
    title: 'İşaretler',
    items: [
      ...MARKS.map(mark => ({
        text: `${keys.includes(mark.key) ? '✓ ' : ''}${mark.label}`,
        callback: popupT => toggleMark(popupT, mark.key),
        alwaysVisible: false,
      })),
      {
        text: compact ? '⤢  Geniş göster — renk ve yazı' : '⤡  Dar göster — sadece renk',
        callback: popupT => setCompact(popupT, !compact),
        alwaysVisible: true,
      },
    ],
    search: { placeholder: 'İşaret ara', empty: 'Eşleşen işaret yok' },
  });
}

async function setCompact(t, compact) {
  await t.set('member', 'private', COMPACT_KEY, compact);
  return t.closePopup();
}

async function openBoardPopup(t) {
  const compact = await readCompact(t);
  return t.popup({
    title: 'İşaret görünümü',
    items: [
      { text: `${compact ? '✓ ' : ''}Dar — sadece renk`, callback: popupT => setCompact(popupT, true) },
      { text: `${compact ? '' : '✓ '}Geniş — renk ve yazı`, callback: popupT => setCompact(popupT, false) },
    ],
  });
}

window.TrelloPowerUp.initialize({
  'card-badges': async t => {
    const [keys, compact] = await Promise.all([readMarks(t), readCompact(t)]);
    return activeMarks(keys).map(mark => badgeFor(mark, compact));
  },

  'card-detail-badges': async t => {
    const keys = await readMarks(t);
    return activeMarks(keys).map(mark => ({
      title: 'İşaret',
      text: mark.label,
      color: mark.color,
      icon: mark.icon ? assetUrl(mark.icon) : undefined,
      monochrome: false,
      callback: openMarkPopup,
    }));
  },

  'card-buttons': () => [
    {
      icon: assetUrl('./icons/button.svg'),
      text: 'İşaretler',
      callback: openMarkPopup,
    },
  ],

  'board-buttons': () => [
    {
      icon: assetUrl('./icons/button.svg'),
      text: 'İşaret görünümü',
      callback: openBoardPopup,
    },
  ],
});
