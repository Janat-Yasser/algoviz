const { algorithms } = require('../models/Algorithm');

exports.getHome = (req, res) => {
  res.render('index', {
    title: 'AlgoViz — Learn Algorithms Visually',
    sorting: algorithms.sorting,
    pathfinding: algorithms.pathfinding,
    trees: algorithms.trees
  });
};
