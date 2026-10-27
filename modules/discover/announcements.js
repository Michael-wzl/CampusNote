const { int, bool } = require('../../core/validate');

// DS-7, BR-17: datetime-local is HKT, including on a machine configured for another timezone.
function validHkt(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
  if (Number(value.slice(0, 4)) < 1000) return false;
  const date = new Date(`${value}:00+08:00`);
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1000) return false;
  return new Date(date.getTime() + 8 * 3600e3).toISOString().slice(0, 16) === value;
}

function validateAnnouncement(values = {}, uploadError) {
  const errors = {};
  const read = (key) => (typeof values[key] === 'string' ? values[key].trim() : '');
  const fields = {
    title: read('title'),
    subtitle: read('subtitle'),
    link_url: read('link'),
    starts: read('starts'),
    ends: read('ends'),
    sort_order: int(values.sort_order ?? '0', { min: 0, max: 255 }),
  };
  if (!fields.title) errors.title = 'Enter a title';
  else if ([...fields.title].length > 60) errors.title = 'At most 60 characters';
  if ([...fields.subtitle].length > 120) errors.subtitle = 'At most 120 characters';
  if (
    fields.link_url &&
    (!/^\/(?![/\\])\S*$/u.test(fields.link_url) ||
      [...fields.link_url].some((c) => c.codePointAt(0) < 32 || c.codePointAt(0) === 127) ||
      [...fields.link_url].length > 255)
  )
    errors.link = 'Use a link inside Campus Notes that starts with /, such as /events/1';
  // DS-7: the schema requires a nonempty path after '/'; root already redirects to /feed.
  if (fields.link_url === '/') fields.link_url = '/feed';
  if (!fields.link_url) fields.link_url = null;
  for (const key of ['starts', 'ends'])
    if (!validHkt(fields[key])) errors[key] = 'Enter a date and time';
  if (!errors.starts && !errors.ends && fields.ends <= fields.starts)
    errors.ends = 'The end must be after the start';
  if (fields.sort_order === null) errors.sort_order = 'Use a number from 0 to 255';
  if (uploadError) errors.image = uploadError;
  return { fields, errors, removeImage: bool(values.remove_image) };
}

module.exports = { validHkt, validateAnnouncement };
