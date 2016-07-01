$(document).ready(function() {

  /** UI ACTIONS **/

  /** Add answer **/
  $('.add-answer').click(function() {
    addAnswer($('.answers'));
  });

  //TODO: create a remove-answer function too

  /** Submit question **/
  $('.create-question').click(function() {
    if ($('.create-question').data('question-created') !== true) { 
      var question = $('.question :input').val();
      var answers = [];
      $('.answers :input').map(function(i, element) { answers.push($(element).val()); });
      submitQuestion(question, answers);
    }
  });


  /** Submit Answer **/
  $(document).on('click', '.answer-button', function() {
    var aid = $('input[name=answer]:checked').data('answer-id');
    var qid = $('input[name=answer]:checked').data('question-id'); 
    answerData = {
      qid: qid,
      aid: aid
    };

    // Only allow submission if question hasn't been answered
    var answeredQuestions = getQuestionCookie();
    if (!answeredQuestions.includes(qid) && typeof aid !== 'undefined') {
      submitAnswer(answerData);
    }
  });


  /** END UI ACTIONS **/

  /** Functions **/

  /**
   * Add an answer field to the question creation form
   */
  var addAnswer = function(container, answer='Add an answer here...') {
    var textBox = '<input type="text" class="answer-field form-control input-lg" name="answer[]" placeholder="' + answer + '">';
    $(container).append(textBox);
  }


  /**
   * Submit a newly-created question
   */
  var submitQuestion = function(question, answers) {
    var questionInfo = {
      'question': question,
      'answers': answers
    };
    $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      url: '/question',
      headers: {'X-HTTP-Method-Override': 'PUT'},
      data: JSON.stringify(questionInfo),
    }).done(function(res, status) {
      $('.create-question').html('Question Created!');
      $('.create-question').data('question-created', true);

      // Refresh the page for now; reload the question form in the future
      setTimeout(function() {
        window.location.reload();
      }, 1000);
    }).fail(function(error) {
      console.log("ERROR" + error);
    });
  };


  /**
   * Get a question for answering
   */
  var getQuestion = function(qID=undefined, random=[""], successFunction) {
    // Add a space to an empty random array in order to allow it to be passed via ajax (lol jQuery)
    if (random.length === 0) { random.push(""); }

    var questionInfo = {
      qid: qID,
      random: random
    };
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      url: '/question',
      headers: {'X-HTTP-Method-Override': 'GET'},
      data: questionInfo
    }).done(function(res, status) {
      successFunction(res, status);
    }).fail(function(error) {
      console.log("ERROR" + error);
    });
  };


  /**
   * Render a question on the answer survey page
   */
  var renderQuestion = function(questionData) {
    if (jQuery.isEmptyObject(questionData)) {
      $('.question').html('<h2>There aren\'t any questions to answer!</h2>');
      $('.answers').html('');
    } else {
      var questionHTML = function(id, question) {
        return '<h2 data-id="' + id + '">' + question + '</h2>';
      };
      var answerHTML = function(answers, questionID) {
        var html = '';
        answers.forEach(function(element) {
          html += '<div class="answer"><input type="radio" class="answer-selection" name="answer" value="' + element.id + '" data-answer-id="' + element.id + '" data-question-id="' + questionID + '"><span class="answer-text">' + element.answer  + '</span></div>';
        });
        return html;
      };
      $('.question').html(questionHTML(questionData.id, questionData.question));
      $('.answers').html(answerHTML(questionData.answers, questionData.id));
    }
  };


  /**
   * Get a list of all questions
   */
  var getQuestionList = function(successFunction) {
    var questionInfo = {
      qid: undefined,
      random: undefined
    };
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      url: '/question',
      headers: {'X-HTTP-Method-Override': 'GET'},
      data: questionInfo
    }).done(function(res, status) {
      successFunction(res, status);
    }).fail(function(error) {
      console.log("ERROR" + error);
    });
  };


  /**
   * Render a list of questions
   */
  var renderQuestionList = function(questionList) {
    if (jQuery.isEmptyObject(questionList)) {
      $('.questions-list').html('<h2>There aren\'t any questions!</h2>');
    } else {
      var questionHTML = function(id, question) {
        return '<div class="question"><h2 data-id="' + id + '">' + id + '. ' + question + '</h2></div>';
      };
      var answerHTML = function(answers, questionID) {
        var html = '';
        answers.forEach(function(element) {
          html += '<div class="answer"><span class="answer-text" data-answer-id="' + element.id + '" data-question-id="' + questionID + '">' + element.answer  + '</span><span class="votes">' + element.responses + '</span></div>'; 
        });
        return html;
      };
      questionList.forEach(function(questionData) {
        var questionElement = '<div class="question-container">' + questionHTML(questionData.id, questionData.question) + answerHTML(questionData.answers, questionData.id) + '</div>';
        $('.questions-list').append(questionElement);
      });
    }
  };


  /**
   * Submit an answer to a question
   */
  var submitAnswer = function(answerData) {
    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      url: '/question',
      data: JSON.stringify(answerData),
    }).done(function(res, status) { 
      var seenQuestions = getQuestionCookie();
      seenQuestions.push(answerData.qid);
      Cookies.set('seen-questions', JSON.stringify(seenQuestions), { expires: 1 });
      getQuestion(undefined, seenQuestions, function(res, status) { renderQuestion(res) });
    }).fail(function(error) {
      console.log("ERROR");
      console.log(error);
    });
  };

  
  /**
   * Get the cookie that stores answered questions
   */
  var getQuestionCookie = function() {
    var data = Cookies.get('seen-questions');
    if (typeof data === 'undefined') {
      return [];
    } else {
      return JSON.parse(data);
    }
  }


  /** END FUNCTIONS **/

  // Initializers
  var page = $(location).attr('pathname');
  switch(page){      
    case '/':
      getQuestion(undefined, getQuestionCookie(), function(res, status) { renderQuestion(res) });
      break;
    case '/admin':
      getQuestionList(function(res, status) { renderQuestionList(res) });
      break;
  }

});
