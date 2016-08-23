/**
 *
 * Views for the app
 *
 **/

const Hashids = require('hashids');

module.exports = (app, dbController) => {
  /**
   * Main view (survey questions)
   **/
  app.get('/', (req, res) =>
    res.render('create-question')
  );


  /**
   * Add question view
   **/
  app.get('/create', (req, res) =>
    res.render('create-question')
  );


  /**
   * Administer a question
   **/
  app.get('/admin/:adminKey', (req, res) => {
    const qID = new Hashids('survey time', 10).decode(req.params.adminKey);
    dbController.getQuestion({ qid: qID }, (questions, err) => {
      if (questions.length > 0 && !err) {
        const qURL = `${req.protocol}://${req.get('host')}/question/${qID}`;
        res.render('administer-question', { qID, qURL });
      } else {
        res.render('404');
      };
    });
  });


  /**
   * Get a random question
   **/
  app.get('/question/random', (req, res) =>
     res.render('answer-question', { qID: req.params.qID })
  );


  /**
   * Get a specific question by it's world-readable ID
   **/
  app.get('/question/:qID', (req, res) => {
    if (isNaN(parseInt(req.params.qID, 10))) {
      res.render('404');
    } else {
      res.render('answer-question', { qID: req.params.qID });
    }
  });


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
    res.render('results-list')
  );


  /**
   * View results view (single)
   **/
  app.get('/results/:questionID', (req, res) =>
    res.render('single-results')
  );


  /**
   * 404 page
   **/
  app.get('*', (req, res) =>
    res.render('404')
  );
};
