const { algorithms } = require('../models/Algorithm');

exports.getHome = (req, res) => {
  res.render('index', {
    title: 'AlgoViz: watch algorithms think',
    sorting: algorithms.sorting,
    pathfinding: algorithms.pathfinding,
    trees: algorithms.trees
  });
};

exports.getRace = (req, res) => {
  const ids = algorithms.sorting.map((a) => a.id);
  let picked = String(req.query.algos || '').split(',').filter((id) => ids.includes(id));
  if (!picked.length) picked = ['bubble', 'insertion', 'merge', 'quick'];
  res.render('race', { title: 'Sorting race | AlgoViz', algorithms: algorithms.sorting, picked });
};
