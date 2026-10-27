// The discover module: feeds, hot ranking, search, the four "my" lists, user pages and announcements.
// DS-1–DS-7 are implemented; admin-only announcement routes are not public smoke paths.
module.exports = {
  name: 'discover',
  router: require('./routes'),
  smoke: [
    '/feed',
    '/feed?tab=watching',
    '/feed?tab=hot',
    '/feed?tab=uni',
    '/feed?tab=share',
    '/feed?tab=food',
    '/search',
    '/search?q=library',
    '/me/posts',
    '/me/watching',
    '/me/likes',
    '/me/history',
    '/u/mandy0hku',
    '/u/jason0ust',
    '/u/filmsoc00',
  ],
};
