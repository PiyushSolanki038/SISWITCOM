const blocked = new Set();

module.exports = {
  add: (userId) => {
    if (userId) blocked.add(String(userId));
  },
  remove: (userId) => {
    if (userId) blocked.delete(String(userId));
  },
  has: (userId) => blocked.has(String(userId)),
  list: () => Array.from(blocked),
};
