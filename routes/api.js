/**
 * API functions
 **/

Sequelize = require('sequelize');

module.exports = function(app, db) {

    /*
    var fs = app.fs;

    app.get('/comments.json', function(req, res) {
        fs.readFile('./public/comments.json', function(err, data) {
            res.setHeader('Cache-Control', 'no-cache');
            res.json(JSON.parse(data));
      });
    });

    app.post('/comments.json', function(req, res) {
        fs.readFile('./public/comments.json', function(err, data) {
            var comments = JSON.parse(data);
            comments.push(req.body);
            fs.writeFile('./public/comments.json', JSON.stringify(comments, null, 4), function(err) {
                res.setHeader('Cache-Control', 'no-cache');
                res.json(comments);
            });
        });
    });
    */
  /**
   * Get a survey question (or all questions)
   * TODO: This API could be extended to allow for batches of answers to 
   * be returned (e.g. 100 at a time)
   * @param {Number} [id] - A question ID (e.g. 123); will return all questions if an
   *  id is not provided and "random" is not set
   * @param {Array.<Number>} [random] - Will retreive a random question that 
   *  hasn't already been seen. The input array should contain a list of previously 
   *  seen questions (can be empty)
   * @return {Array.Object} - Array of Json containing the survey question and answers
   *  @param {Number} id - The question ID
   *  @param {String} question - The question
   *  @param {Array.<Object>} - Answer data
   *    @param {Number} id - Answer ID
   *    @param {String} answer - Answer
   *    @param {Number} votes - Number of votes
   **/
  app.get('/question', function(req, res) {
    console.log("get");
    console.log(req.query);
    var data = req.query;
    if (typeof data.id !== 'undefined' && !isNaN(data.id)) {
      db.question.find({ where: { id: data.id }, include: ['answer'] }).then(function(q) {
        console.log(q);
      }).catch(function(error) {
        console.log("Error" + error);
      });
    }
  });
 

  /**
   * Create a survey question
   * @TODO: Authorized users only
   * @param {Object} info - JSON containing question information
   *  @param {String} question - The question
   *  @param {Array.<String>} answers - The answers
   * @return {Object} - Question Info
   *  @param {Number} id - Question ID; Will be blank on failure
   *  @param {Number} status - An HTTP status code (200 means you won)
   **/
  app.put('/question', function(req, res) {
    console.log("put");
    
    var testQuestion  = {
      text: 'How are you?',
      answers: ['Bad', 'Ok', 'Good']
    }
   
    Sequelize.Promise.resolve({}).then(function(context) {
      return db.questions.create({text: testQuestion.text}).then(function(question) {
        context.question = question;
        return context;
      }).then(function(context) {
        context.answers = Sequelize.Promise.map(testQuestion.answers, function(a) {
          db.answers.create({text: a}).then(function(answer) {
            return context.question.addAnswer(answer);
          });
        });
        return context;
      }).then(function(context) {
        console.log(context);
      }).catch(function(error) {
        console.log("ERROR: " + error);
      });
    });

  });

  /**
   * Delete a survey question. A user must have a valid admin ID to delete a question.
   * @TODO: Authorized users only
   * @param {number} id - A question ID (e.g. 123)
   * @return {Number} - An HTTP status code (200 means you deleted that sucker)
   **/
  app.delete('/question', function(req, res) {
    console.log("delete");
  });

  /**
   * Post an answer to a given survey question
   * TODO: Prevent a user from answering multiple times via:
   * cookie, IP, rate-limiting?
   * the same survey question multiple times
   * @param {Number} qid - A question ID (e.g. 123)
   * @param {String} aid - An answer ID
   **/
  app.post('/question', function(req, res) {
    console.log("post");
  });

};
