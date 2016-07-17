/**
 *
 * Views for the app
 *
 **/

module.exports = function(app) {

  /**
   * Main page (survey questions)
   **/
  app.get('/', function(req, res) {
    res.render('answer-question', { title: 'Survey Time' });
  });

  /**
   * Get a specific question by it's world-readable ID
   **/
  app.get('/:questionID', function(req, res) {
     res.render('answer-question', { title: 'Survey Time', qid: req.params.questionID });
  }

  /**
   * Login page to get to the admin interface
   * NOTE: Currently unused
   **/
  app.get('/login', function(req, res) {

  });

  /**
   * Logout page
   * NOTE: Currently unused
   **/
  app.get('/logout', function(req, res) {

  });

  /**
   * Admin survey results page
   **/
  app.get('/admin', function(req, res) {
    res.render('admin', { title: 'All Questions' });
  });

  /**
   * Admin add question page
   **/
  app.get('/admin/question', function(req, res) {
    res.render('create-question', { title: 'Create Question' });  
  });

  app.get('*', function(req, res){
    res.render('404', { title: 'Survey Time' });
  });

}
