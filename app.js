var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var validator = require('validator');

var Sequelize = require('sequelize');
var sequelize = new Sequelize('survey_app', 'surveyuser', 'every1lovessurveys', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql'
});
var db = require('./models/model.js')(sequelize);
var dbController = require('./lib/database.js')
dbController.init(db);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator({
  customValidators: {
    isNotUndefined: function(value) {
      return typeof value !== 'undefined';
    },
    isArray: function(value) {
      return Array.isArray(value);
    },
    answersAreNotEmpty: function(values) {
      return values.every(function(value) {
        if (validator.isNull(value)) {
          return false;
        } else {
          return true;
        }
      });
    },
    randomContainsNumbers: function(values) {
      if (values.length === 0) {
        return true;
      } else if (values.length === 1 && values[0] === '') {
        return true;
      } else {
        return values.every(function(value) {
          if (validator.isInt(value)) {
            return true;
          } else {
            return false;
          }
        });
      }
    }
  },
  customSanitizers: {
    trimAnswers: function(values) {
      return values.map(function(value) {
        return value.trim();
      });
    }
  }
}));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
var api = require('./routes/api')(app, dbController);
var views = require('./routes/views')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  console.log("DEVELOPMENT MODE");
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.set('env', 'development');
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});

//module.exports = app;
