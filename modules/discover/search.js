// DS-4/D17: require each 2+ character word without passing user boolean operators to MySQL.
function toBooleanQuery(query) {
  const words = query
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .split(' ')
    .filter((word) => [...word].length >= 2)
    .slice(0, 10);
  return words.length ? words.map((word) => `+"${word}"`).join(' ') : null;
}

module.exports = { toBooleanQuery };
