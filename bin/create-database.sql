DROP DATABASE survey_app;
CREATE DATABASE survey_app;
DROP USER 'surveyuser'@'localhost';
CREATE USER 'surveyuser'@'localhost' IDENTIFIED BY 'every1lovessurveys';
GRANT ALL PRIVILEGES ON survey_app.* to 'surveyuser'@'localhost';
