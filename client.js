const FLAGS_KEY = 'flags';
const NO_FLAGS = { urgent: false, bug: false };

const MARKS = [
  { key: 'urgent', label: 'Acil', icon: './icons/urgent.svg', badgeText: 'ACİL' },
  { key: 'bug', label: 'Bug', icon: './icons/bug.svg', badgeText: 'BUG' },
];

function readFlags(t) {
  return t.get('card', 'shared', FLAGS_KEY, NO_FLAGS);
}

function activeMarks(flags) {
  return MARKS.filter(mark => flags[mark.key]);
}

async function toggleMark(t, key) {
  const flags = await readFlags(t);
  await t.set('card', 'shared', FLAGS_KEY, { ...flags, [key]: !flags[key] });
  return t.closePopup();
}

async function openMarkPopup(t) {
  const flags = await readFlags(t);
  return t.popup({
    title: 'İşaretler',
    items: MARKS.map(mark => ({
      text: flags[mark.key] ? `${mark.label} işaretini kaldır` : `${mark.label} olarak işaretle`,
      callback: popupT => toggleMark(popupT, mark.key),
    })),
  });
}

window.TrelloPowerUp.initialize({
  'card-badges': async t => {
    const flags = await readFlags(t);
    return activeMarks(flags).map(mark => ({ icon: mark.icon, monochrome: false }));
  },

  'card-detail-badges': async t => {
    const flags = await readFlags(t);
    return activeMarks(flags).map(mark => ({
      title: 'İşaret',
      text: mark.badgeText,
      icon: mark.icon,
      monochrome: false,
      callback: openMarkPopup,
    }));
  },

  'card-buttons': () => [
    {
      icon: './icons/button.svg',
      text: 'İşaretler',
      callback: openMarkPopup,
    },
  ],
});
