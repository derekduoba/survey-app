/**
 * API functions
 **/

Sequelize = require('sequelize');

module.exports = function(app, dbController) {

  /**
   * Get a survey question (or all questions)
   * TODO: This API could be extended to allow for batches of answers to 
   * be returned (e.g. 100 at a time)
   * @param {Number} [qid] - A question ID (e.g. 123); will return all questions if an
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
    try {
      req.check('qid', '"qid" is not a Number').optional().isInt();
      req.check('random', '"random" is undefined or is not an Array of Numbers').optional().isArray().randomContainsNumbers();
      var data = req.query;

    } catch(error) {
      console.log("VALIDATION CODE ERROR");
      console.log(error);
    }
    var errors = req.validationErrors();
    if (errors) {
      console.log("INPUT DATA ERROR");
      console.log(errors);
      res.send(400);
      return;
    } else {
      console.log("VALIDATION PASS");
    }
    dbController.getQuestion(data, function(questions, error) {
      if (error) {
        res.status(400).json(questions);
      } else {
        res.status(200).json(questions);
      }
    });
  });


  /**
   * Create a survey question
   * TODO: Authorized users only
   * @param {Object} info - JSON containing question information
   *  @param {String} question - The question
   *  @param {Array.<String>} answers - The answers
   * @return {Object} - Question Info
   *  @param {Number} id - Question ID; Will be blank on failure (check the HTTP status code)
   **/
  app.put('/question', function(req, res) {
    try {
      req.sanitize('question').trim();
      req.sanitize('answers').trimAnswers();
      req.assert('question', '"question" is undefined').isNotUndefined();
      req.assert('question', 'Question must exist').optional().notEmpty();
      req.assert('answers', '"answers" is undefined').isNotUndefined();
      req.assert('answers', 'Answers must be specified').optional().answersAreNotEmpty();
      var data = req.body;
    } catch(error) {
      console.log("VALIDATION CODE ERROR");
      console.log(error);
    }
    var errors = req.validationErrors();
    if (errors) {
      console.log("INPUT DATA ERROR");
      console.log(errors);
      res.status(400).json({});
      return;
    } else {
      console.log("VALIDATION PASS");
    }
    dbController.createQuestion(data, function(questionResponse) {
      if (typeof questionResponse.id === 'undefined') {
        res.status(400).json(questionResponse);
      } else {
        res.status(201).json(questionResponse);
      }
    });
  });


  /**
   * Delete a survey question. A user must have a valid admin ID to delete a question.
   * @TODO: Authorized users only
   * @param {number} id - A question ID (e.g. 123)
   * @return {Number} - An HTTP status code (200 means you deleted that sucker)
   **/
  app.delete('/question', function(req, res) {
    try {
      req.checkBody('qid', '"qid" is undefined or not a Number').isNotUndefined().isInt();
      var data = req.body;

    } catch(error) {
      console.log("VALIDATION CODE ERROR");
      console.log(error);
    }
    var errors = req.validationErrors();
    if (errors) {
      console.log("INPUT DATA ERROR");
      console.log(errors);
      res.send(400);
      return;
    } else {
      console.log("VALIDATION PASS");
    }
    dbController.deleteQuestion(data.qid, function(res) {
      if (res) {
        res.sendStatus(204);
      } else {
        res.status(400).send({status: 'failure'});
      }     
    });

  });


  /**
   * Post an answer to a given survey question
   * TODO: Prevent a user from answering multiple times via:
   * cookie, IP, rate-limiting?
   * the same survey question multiple times
   * @param {Number} qid - A question ID (e.g. 123)
   * @param {Number} aid - An answer ID (e.g. 3)
   **/
  app.post('/question', function(req, res) {
    try {
      req.checkBody('aid', '"aid" is undefined or not a Number').isNotUndefined().isInt();
      req.checkBody('qid', '"qid" is undefined or not a Number').isNotUndefined().isInt();
      var data = req.body;

    } catch(error) {
      console.log("VALIDATION CODE ERROR");
      console.log(error);
    }
    var errors = req.validationErrors();
    if (errors) {
      console.log("INPUT DATA ERROR");
      console.log(errors);
      res.status(400).send({status: 'failure'});
      return;
    } else {
      console.log("VALIDATION PASS");
    }
    dbController.updateVotes(data.qid, data.aid, function(success) {
      if (success) {
        res.sendStatus(204);
      } else {
        res.status(400).send({status: 'failure'});
      }
    });
  });

};
