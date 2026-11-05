// Copyright (c) 2026 Janat Yasser. All rights reserved.
const { algorithms } = require('../models/Algorithm');

exports.getIndex = (req, res) => {
  const algo = algorithms.pathfinding.find(a => a.id === (req.query.algo || 'dijkstra'));
  res.render('algorithms/pathfinding', {
    title: 'Pathfinding — AlgoViz',
    algo: algo || algorithms.pathfinding[0],
    allAlgos: algorithms.pathfinding
  });
};
