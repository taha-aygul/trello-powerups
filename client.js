const COMPACT_KEY = 'compact';
const SHADE_SUFFIX = /_(dark|light)$/;

const ICONS = {
  acil: './icons/urgent.svg',
  bug: './icons/bug.svg',
  bugfix: './icons/bug.svg',
};

function baseHue(labelColor) {
  return labelColor ? labelColor.replace(SHADE_SUFFIX, '') : 'light-gray';
}

function iconFor(labelName) {
  return ICONS[labelName.toLocaleLowerCase('tr')];
}

function readCompact(t) {
  return t.get('member', 'private', COMPACT_KEY, false);
}

function namedLabels(labels) {
  return labels.filter(label => label.name && label.name.trim().length > 0);
}

function badgeFor(label, compact) {
  if (compact) {
    return { color: baseHue(label.color) };
  }
  return {
    text: label.name.toLocaleUpperCase('tr'),
    color: baseHue(label.color),
    icon: iconFor(label.name),
    monochrome: false,
  };
}

async function setCompact(t, compact) {
  await t.set('member', 'private', COMPACT_KEY, compact);
  return t.closePopup();
}

async function openViewPopup(t) {
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
    const [labels, compact] = await Promise.all([t.card('labels').get('labels'), readCompact(t)]);
    return namedLabels(labels).map(label => badgeFor(label, compact));
  },

  'card-detail-badges': async t => {
    const labels = await t.card('labels').get('labels');
    return namedLabels(labels).map(label => ({
      title: 'İşaret',
      text: label.name.toLocaleUpperCase('tr'),
      color: baseHue(label.color),
      icon: iconFor(label.name),
      monochrome: false,
      callback: openViewPopup,
    }));
  },

  'board-buttons': () => [
    {
      icon: './icons/button.svg',
      text: 'İşaret görünümü',
      callback: openViewPopup,
    },
  ],
});
