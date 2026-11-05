// Copyright (c) 2026 Janat Yasser. All rights reserved.
const { algorithms } = require('../models/Algorithm');

exports.getIndex = (req, res) => {
  res.render('algorithms/trees', {
    title: 'Binary Search Tree — AlgoViz',
    algo: algorithms.trees[0],
    allAlgos: algorithms.trees
  });
};
