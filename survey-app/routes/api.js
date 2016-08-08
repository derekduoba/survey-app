/**
 * API functions
 **/

module.exports = function (app, dbController) {
  /**
   * Handle validation errors
   * @param {Object} res - The response to return to the client
   * @param {String} message - The error message to be printed to the system console
   * @param {Object} error - The error data to print to the system console
   */
  function handleValidationErrors(res, message, error) {
    const errorInfo = JSON.stringify(error, null, 2);
    console.error(`${message}: \n ${errorInfo}`);
    res.send(400);
  };

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
  app.get('/question', (req, res) => {
    try {
      req.check('qid', '"qid" is not a Number').optional().isInt();
      req.check('random', '"random" is undefined or is not an Array of Numbers')
      .optional()
      .isArray()
      .randomContainsNumbers();
      const data = req.query;
      const error = req.validationErrors();
      if (error) {
        handleValidationErrors(res, 'INPUT DATA ERROR', error);
        return;
      };
      dbController.getQuestion(data, (questions, err) => (
        err ? res.status(400).json(questions) : res.status(200).json(questions)
      ));
    } catch (error) {
      handleValidationErrors(res, 'VALIDATION ERROR', error);
      return;
    };
  });


  /**
   * Create a survey question
   * @param {Object} info - JSON containing question information
   *  @param {String} question - The question
   *  @param {Array.<String>} answers - The answers
   * @return {Object} - Question Info
   *  @param {Number} id - Question ID; Will be blank on failure (check the HTTP status code)
   **/
  app.put('/question', (req, res) => {
    try {
      req.sanitize('question').trim();
      req.sanitize('answers').trimAnswers();
      req.assert('question', '"question" is undefined').isNotUndefined();
      req.assert('question', 'Question must exist').optional().notEmpty();
      req.assert('question', 'Question length too long (250 character max)')
      .optional()
      .questionIsNotTooLong();
      req.assert('answers', '"answers" is undefined').isNotUndefined();
      req.assert('answers', 'Answers must be specified').optional().answersAreNotEmpty();
      req.assert('answers', 'Answer length too long (250 character max)')
      .optional()
      .answersAreNotTooLong();
      const data = req.body;
      const error = req.validationErrors();
      if (error) {
        handleValidationErrors(res, 'INPUT DATA ERROR', error);
        return;
      };
      dbController.createQuestion(data, (questionResponse) => (
        (typeof questionResponse.id === 'undefined') ?
          res.status(400).json(questionResponse) :
          res.status(201).json(questionResponse)
      ));
    } catch (error) {
      handleValidationErrors(res, 'VALIDATION ERROR', error);
      return;
    };
  });


  /**
   * Delete a survey question. A user must have a valid admin ID to delete a question.
   * @TODO: Authorized users only
   * @param {number} id - A question ID (e.g. 123)
   * @return {Number} - An HTTP status code (200 means you deleted that sucker)
   **/
  app.delete('/question', (req, res) => {
    try {
      req.checkBody('qid', '"qid" is undefined or not a Number').isNotUndefined().isInt();
      const data = req.body;
      const error = req.validationErrors();
      if (error) {
        handleValidationErrors(res, 'INPUT DATA ERROR', error);
        return;
      };
      dbController.deleteQuestion(data.qid, (deleteRes) => (
        (deleteRes) ? deleteRes.sendStatus(204) : deleteRes.status(400).send({ status: 'failure' })
      ));
    } catch (error) {
      handleValidationErrors(res, 'VALIDATION ERROR', error);
      return;
    };
  });


  /**
   * Post an answer to a given survey question
   * TODO: Prevent a user from answering multiple times via:
   * cookie, IP, rate-limiting?
   * the same survey question multiple times
   * @param {Number} qid - A question ID (e.g. 123)
   * @param {Number} aid - An answer ID (e.g. 3)
   **/
  app.post('/question', (req, res) => {
    try {
      req.checkBody('aid', '"aid" is undefined or not a Number').isNotUndefined().isInt();
      req.checkBody('qid', '"qid" is undefined or not a Number').isNotUndefined().isInt();
      const data = req.body;
      const error = req.validationErrors();
      if (error) {
        handleValidationErrors(res, 'INPUT DATA ERROR', error);
        return;
      };
      dbController.updateVotes(data.qid, data.aid, (success) => (
        (success) ? res.sendStatus(204) : res.status(400).send({ status: 'failure' })
      ));
    } catch (error) {
      handleValidationErrors(res, 'VALIDATION ERROR', error);
      return;
    };
  });
};
