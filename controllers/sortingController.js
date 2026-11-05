// Copyright (c) 2026 Janat Yasser. All rights reserved.
const { algorithms } = require('../models/Algorithm');

exports.getIndex = (req, res) => {
  res.render('algorithms/sorting-index', {
    title: 'Sorting Algorithms — AlgoViz',
    algorithms: algorithms.sorting
  });
};

exports.getAlgorithm = (req, res) => {
  const algo = algorithms.sorting.find(a => a.id === req.params.id);
  if (!algo) return res.redirect('/sorting');
  res.render('algorithms/sorting', {
    title: `${algo.name} — AlgoViz`,
    algo,
    allAlgos: algorithms.sorting
  });
};
