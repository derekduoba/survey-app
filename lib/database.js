/**
 * Database interation controller
 * TODO: Methods use callbacks for now. These should be converted to
 * promises at some point
 **/

Sequelize = require('sequelize'); 

module.exports = (function() {

  var db;

  var logError = function(error) {
    console.log("DATABASE ERROR: \n" + error)
  }

  return {
    /**
     * Initialize the module using a SequelizeJS object
     * @param {Object} db - A SequelizeJS object
     */
    init: function(database) {
      db = database;
    },


    /**
     * Create a survey question
     * @param {Object} questionData - JSON containing question information
     *  @param {String} question - The question
     *  @param {Array.<String>} answers - The answers
     * @return {Object} - Question Info
     *  @param {Number} id - Question ID; Will be blank on failure
     */  
    createQuestion: function(questionData, callback) {
      Sequelize.Promise.resolve({}).then(function(context) {
        return db.questions.create({question: questionData.question}).then(function(question) {
          context.question = question;
          return context;
        }).then(function(context) {
          context.answers = Sequelize.Promise.map(questionData.answers, function(a) {
            db.answers.create({answer: a}).then(function(answer) {
              return context.question.addAnswer(answer);
            });
          });
          return context;
        }).then(function(context) {
          callback({id: context.question.id});
        }).catch(function(error) {
          logError(error);
          callback({});
        });
      });
    },


    /**
     * Get a survey question (or all questions)
     * TODO: This API could be extended to allow for batches of answers to 
     * be returned (e.g. 100 at a time)
     * There are three different ways to obtain data using this function:
     * 1.) Get all questions by passing no data in the request object
     * 2.) Get a "random" question by passing an array in the request.random property. This array may
     *  optionally contain a list of question IDs to ignore when choosing a question. At the moment
     *  the "randomly chosen" question will simply be the question with the lwest ID that has not
     *  already been answered
     * 3.) Get a specific question by specifying an ID (e.g. 123) in the request.id property
     *
     * @param {Object} request - JSON containing question lookup information
     *  @param {Number} [id] - A question ID (e.g. 123); will return all questions if an
     *    id is not provided and "random" is not set
     *  @param {Array.<Number>} [random] - Will retreive a random question that 
     *    hasn't already been seen. The input array should contain a list of previously 
     *    seen questions (can be empty)
     * @return {Array.Object} or {Object} - Array of objects containing the survey questions and answers 
     *  (multiple questions), a single object containing the survey question and answers or an empty object
     *  if no questions are found
     *  @param {Number} id - The question ID
     *  @param {String} question - The question
     *  @param {Array.<Object>} - Answer data
     *    @param {Number} id - Answer ID
     *    @param {String} answer - Answer
     *    @param {Number} responsess - Number of votes
     */
    getQuestion: function(request, callback) {
      if (typeof request.id === 'undefined' && typeof request.random === 'undefined' ) { // all questions
        db.questions.findAll({ 
          where: {}, 
          include: [{
            model: db.answers
          }] 
        }).then(function(questions) {
          if (questions != null) {
            var questionList = []
            questions.forEach(function(question) {
              var answerData = question.dataValues.answers;
              var answers = answerData.map(function(a) {
                return {
                  id: a.dataValues.id,
                  answer: a.dataValues.answer,
                  responses: a.dataValues.responses
                }
              });
              var questionData = {
                id: question.id,
                question: question.dataValues.question,
                answers: answers
              }
              questionList.push(questionData);
            });

            callback(questionList);
          } else {
            callback({});
          }

        }).catch(function(error) {
          logError(error);
        });
      } else if (typeof request.id === 'undefined' && typeof request.random !== 'undefined' && Array.isArray(request.random)) { // random question
        db.questions.findOne({ 
          where: { id: { $not: request.random } },
          attributes: ['id', 'question'] ,
          include: [{
            model: db.answers,
            where: { question_id: Sequelize.col('questions.id') },
            attributes: [ 'id', 'answer', 'responses']
          }]
        }).then(function(question) {
          if (question != null) {
            var answerData = question.dataValues.answers;
            var answers = answerData.map(function(a) {
              return {
                id: a.dataValues.id,
                answer: a.dataValues.answer,
                responses: a.dataValues.responses
              }
            });
            var questionData = {
              id: question.id,
              question: question.dataValues.question,
              answers: answers
            }
            callback(questionData);
          } else {
            callback({});
          }
        }).catch(function(error) {
          logError(error);
          callback({}, error);
        });
      } else if (typeof request.id !== 'undefined' && !isNaN(request.id)) { // specific question
        db.questions.find({ 
          where: { id: request.id }, 
          attributes: ['id', 'question'] ,
          include: [{
            model: db.answers,
            where: { question_id: Sequelize.col('questions.id') },
            attributes: [ 'id', 'answer', 'responses']
          }]
        }).then(function(question) {
          var answerData = question.dataValues.answers;
          var answers = answerData.map(function(a) {
            return {
              id: a.dataValues.id,
              answer: a.dataValues.answer,
              responses: a.dataValues.responses
            }
          });
          var questionData = {
            id: question.id,
            question: question.dataValues.question,
            answers: answers
          }
          callback(questionData);
        }).catch(function(error) {
          logError(error);
        });
      }
    },


    /**
     * Increment the number of votes for a question's answer
     * @param {Number} questionID - A question ID (e.g. 123)
     * @param {Number} answerID - A corresponding answer ID (e.g. 3)
     * @return {Boolean} true on success; false + error data on failure
     */
    updateVotes: function(questionID, answerID, callback) {
      db.answers.find({
        where: { 
          question_id: questionID,
          id: answerID
        }
      }).then(function(record) {
        if (record) {
          record.increment('responses').then(function() {
            callback(true);
          });
        } else {
          logError('No matching answer for qID=' + questionID + ' aID=' + answerID);
          callback(false);
        }
      }).catch(function(error) {
        logError(error);
        callback(false);
      }); 

    },


    /**
     * Delete a question and all linked answers
     * Note: This is not currently used
     * @param {Number} questionID - a question id (e.g. 123)
     * @return {Boolean} true on success; false + error data otherwise
     */
    deleteQuestion: function(questionID, callback) {
      db.questions.destroy({ 
        where: { id: questionID },
        force: true
      }).then(function() {
        callback(true);
      }).catch(function(error) {
        logError(error);
      });
    },


    /**
     * Delete an answer from a question
     * Note: This will not be used for now
     * @param {Number} questionID - a question id (e.g. 123)
     * @return {Boolean} true on success; false + error data otherwise
     */
    deleteAnswer: function(questionID, answerID, callback) {
      db.answers.destroy({ 
        where: { 
          question_id: questionID,
          id: answerID
        },
        force: true
      }).then(function() {
        callback(true);
      }).catch(function(error) {
        logError(error);
      });         
    }
  };
})();
