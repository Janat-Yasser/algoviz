const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/sorting', require('./routes/sorting'));
app.use('/pathfinding', require('./routes/pathfinding'));
app.use('/trees', require('./routes/trees'));

app.use((req, res) => {
  res.status(404).render('404', { layout: 'layouts/main', title: '404' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 AlgoViz running → http://localhost:${PORT}`));
