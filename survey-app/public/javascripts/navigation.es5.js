$(document).ready(function() {

  /** Functions **/

  /**
   * Add an answer field to the question creation form
   */
  var addAnswer = function(container, answer='Add an answer here...') {
    var textBox = '<input type="text" class="answer-field form-control input-lg" name="answer[]" placeholder="' + answer + '">';
    $(container).append(textBox);
  };


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
      $('.bottom-button').html('Question Created!');
      $('.create-question').data('question-created', true);
      var questionURL = window.location.origin + '/question/' + res.id;
      $('.content').html(
        '<h2 class="message">Here\'s a link to your question</h2>' +
          '<form>' +
          '<div id="question-url" class="input-group">' +
          '<input type="text" id="copy-input" class="form-control input-lg" value="' + questionURL + '" placeholder="Question URL">' +
          '<span class="input-group-btn">' +
          '<button class="btn btn-lg" type="button" id="copy-button" data-placement="button" title="Copy to Clipboard">' +
          'Copy Link' +
          '</button>' +
          '</span>' +
          '</div>' +
          '<button class="btn btn-lg" type="button" id="view-result" data-placement="button" data-question-id="' + res.id + '" title="View Results">' +
          'View Results' +
          '</button>' +
          '</form>'
      );
    }).fail(function(error) {
      console.log("ERROR" + error);
    });
  };


  /**
   *  Copy a question URL to the clipboard
   **/
  var copyQuestionURL = function() {    
    var input = document.querySelector('#copy-input');  
    input.setSelectionRange(0, input.value.length + 1); 
    try {  
      var success = document.execCommand('copy');  
      if (success) { 
        $('.message').html('Survey URL copied to the clipboard.'); 
      } else {
        $('.message').html('Could not automatically copy the URL to the clipboard. Try copying it manually.'); 
      }
    } catch(err) {  
      $('.message').html('Could not automatically copy the URL to the clipboard. Try copying it manually.');
    }  
    window.getSelection().removeAllRanges();   
  };


  /**
   * Get information about a question (or a list of questions)
   */
  var getQuestionData = function(qID, random, successFunction) {
    // Add a space to an empty random array in order to allow it to be passed via ajax (lol jQuery)
    if (typeof random !== 'undefined' && random.length === 0) { random.push(""); }

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
      console.log("ERROR");
      console.log(error);
    });
  };


  /**
   * Render a question on the answer question page
   */
  var renderQuestion = function(questionData, emptyMessage=undefined) {
    if (jQuery.isEmptyObject(questionData)) {
      if (typeof emptyMessage !== 'undefined') {
        $('.content').html('<h2>' + emptyMessage + '</h2>');
      } else {
        $('.content').html('<h2>There aren\'t any questions!</h2>');
      }  
    } else {
      var questionHTML = function(id, question) {
        return '<h2 data-id="' + id + '">' + question + '</h2>';
      };
      var answerHTML = function(answers, questionID) {
        var html = '';
        answers.forEach(function(element) {
          html += '<div class="answer">' +
            '<input type="radio" class="answer-selection" name="answer" value="' + element.id + '" data-answer-id="' + element.id + '" data-question-id="' + questionID + '">' +
            '<span class="answer-text">' + element.answer  + '</span>' +
            '</div>';
        });
        return html;
      };
      $('.question').html(questionHTML(questionData.id, questionData.question));
      $('.answers').html(answerHTML(questionData.answers, questionData.id));
    }
  };


  /**
   * Render a single question's result
   **/
  var renderQuestionResult = function(questionData) {

    var questionHTML = function(id, question) {
      return '<div class="question"><h2 data-id="' + id + '">' + id + '. ' + question + '</h2></div>';
    };

    var calculateAnswerPercent = function(totalResponses, answerResponseCount) {
      var width = (answerResponseCount/totalResponses)*100;
      return 'value="' + width + '"';
    };

    var answerHTML = function(answers, questionData) {
      var html = '';
      answers.forEach(function(element) {
        html += '<div class="answer">' +
          '<progress class="answer-bar" max="100" ' + calculateAnswerPercent(questionData.total_responses, element.responses) + '></progress>' +
          '<span class="answer-text" data-answer-id="' + element.id + '" data-question-id="' + questionData.id + '">' +
          element.answer + 
          '</span>' +
          '<span class="votes">' + element.responses + '</span>' +
          '</div>'; 
      });
      return html;
    };

    var renderedQuestionResponse = '<div class="question-container">' + questionHTML(questionData.id, questionData.question) + answerHTML(questionData.answers, questionData) + '</div>';
    return renderedQuestionResponse;
  };


  /**
   * Render a list of question results as a collection
   */
  var renderQuestionResults = function(questionList, emptyMessage=undefined) {
    if (questionList.length === 0) {
      if (typeof emptyMessage !== 'undefined') {
        $('.content').html('<h2>' + emptyMessage + '</h2>');
      } else {
        $('.content').html('<h2>There aren\'t any questions!</h2>');
      }
    } else if (questionList.length === 1) {
      $('.question-results.single').html(renderQuestionResult(questionList[0]));
    } else {
      questionList.forEach(function(questionData) {
        $('.question-results.list').append(renderQuestionResult(questionData));
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
      var page = $(location).attr('pathname');
      switch(page) {
        case '/question/random':
          getQuestionData(undefined, seenQuestions, function(res, status) { renderQuestion(res[0]) });
          break;
        default:
          window.location = window.location.origin + '/results/' + answerData.qid; 
          break;
      }
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
  };


  /** END FUNCTIONS **/


  // Initializers
  var page = $(location).attr('pathname');
  switch(page) {      
    case '/question/random':
      getQuestionData(undefined, getQuestionCookie(), function(res, status) { renderQuestion(res[0]) });
      break;
    case (page.match(/\/question\/\d+/) || {}).input:
      var parts = page.split("/");
      var qID = (parts.length > 2) ? parseInt(parts[2]) : undefined;
      var cookies = getQuestionCookie();
      if (typeof qID !== 'undefined' && cookies.indexOf(qID) >= 0) { window.location = window.location.origin + '/results/' + qID; }
      getQuestionData(qID, getQuestionCookie(), function(res, status) { renderQuestion(res[0], 'This question doesn\'t exist.') });
      break;
    case '/results/list':
      getQuestionData(undefined, undefined, function(res, status) { renderQuestionResults(res) });
      break;
    case (page.match(/\/results\/\d+/) || {}).input:
      var parts = page.split("/");
      var qID = (parts.length > 2) ? parts[2] : undefined
      getQuestionData(qID, undefined, function(res, status) { renderQuestionResults(res, 'This question doesn\'t exist.') });
      break;
  };


  /** UI ACTIONS **/

  /** Add answer **/
  $('.add-answer').click(function() {
    addAnswer($('.answers'));
  });

  //TODO: create a remove-answer function too

  /** Submit question **/
  $('button.create-question').click(function() {
    if ($('.create-question').data('question-created') !== true) { 
      var question = $('.question :input').val();
      var answers = [];
      $('.answers :input').map(function(i, element) { answers.push($(element).val()); });
      if (question && answers.length > 0) { submitQuestion(question, answers); };
    };
  });


  /** Submit Answer **/
  $(document).on('click', '.answer-button', function() {
    var aID = $('input[name=answer]:checked').data('answer-id');
    var qID = $('input[name=answer]:checked').data('question-id'); 
    answerData = {
      qid: qID,
      aid: aID
    };
    // Only allow submission if question hasn't been answered
    var answeredQuestions = getQuestionCookie();
    
    if (!answeredQuestions.includes(qID) && typeof aID !== 'undefined') {
      submitAnswer(answerData);
    } else if (answeredQuestions.includes(qID)){
      window.location = window.location.origin + '/results/' + qID;
    }
  });


  /** Auto-clipboard **/
  $(document).on('click', '#copy-button', copyQuestionURL);


  /** View question results **/
  $(document).on('click', '#view-result', function() {
    var qID = $(this).data('question-id');
    window.open(window.location.origin + '/results/' + qID, '_blank');
  });


  /** END UI ACTIONS **/


});
