/**
 *
 * Views for the app
 *
 **/

module.exports = (app) => {
  /**
   * Main view (survey questions)
   **/
  app.get('/', (req, res) =>
    res.render('create-question', { title: 'Survey Time' })
  );

  /**
   * Add question view
   **/
  app.get('/create-question', (req, res) =>
    res.render('create-question', { title: 'Create Question' })
  );

  /**
   * Get a specific question by it's world-readable ID
   **/
  app.get('/question/:questionID', (req, res) =>
     res.render('answer-question', { title: 'Survey Time', qid: req.params.questionID })
  );

  /**
   * Get a specific question by it's world-readable ID
   **/
  app.get('/question/random', (req, res) =>
     res.render('answer-question', { title: 'Survey Time', qid: req.params.questionID })
  );


  /**
   * Login page to get to the admin interface
   * NOTE: Currently unused
  app.get('/login', function(req, res) {

  });
  **/

  /**
   * Logout page
   * NOTE: Currently unused
  app.get('/logout', function(req, res) {

  });
  **/

  /**
   * All survey results
   **/
  app.get('/results/list', (req, res) =>
    res.render('results-list', { title: 'All Questions' })
  );

  /**
   * View results view (single)
   **/
  app.get('/results/:questionID', (req, res) =>
    res.render('single-results', { title: 'View Question Results' })
  );

  /**
   * 404 page
   **/
  app.get('*', (req, res) =>
    res.render('404', { title: 'Survey Time' })
  );
};
