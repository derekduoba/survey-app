# SurveyTimeA simple survey app designed to help people create hassle-free polls on the quick.SurveyTime allows users to create single-question, multi-answer polls in a matter of minutes. Surveys can be accessed viaunique URLs generated at creation time. Each survey also includes a simple results view.Users are prevented from answering multiple times through the use of browser cookies (although this can be subvertedwith relative ease).In addition to single-survey views, the app also includes multi-question and batch result views.```Note: This app is a work in progress. Expect it to change frequently.```## Built With* Node.JS (Stable)* Express* Jade* jQuery* Bootstrap 4* SASS* MySQL* SequelizeJS* Docker* Babel* Hashids## How to Use### Deploying SurveyTime1. Download and install [Docker](https://www.docker.com/) and [Docker-Compose](https://docs.docker.com/compose/).2. Change the variables in `database.env` to something of your choosing (or leave them as-is).  * DATABASE_HOST - The name used to link the app container to the db container.  * MYSQL_DATABASE - The database name. This will be created at runtime.  * MYSQL_USER - The database user. This will be created at runtime.  * MYSQL_PASSWORD - The aforementioned database user's password.3. Run the following command to build and deploy the app:  `docker-compose up`#### Notes* The app is accessible on port 3000 by default. This value can be changed by editing `docker-compose.yml`.* For the time being, the app will attempt to initialize the database schema for 5 minutes. Any longer and the app will fail to come up. If the database schema cannot be initialized, make sure Docker is properly configured and that the underlying resources are adequate to support Docker, Node.js, and MySQL simultaneously. I will likely modify the app's initialization routines in the future.* The app only supports singlular Node.js and MySQL instances currently. ### URLs```/```The main survey-creation view.```/create```Another way to access the main survey-creation view.```/question/:questionID```The default single survey / question view. ":questionID" should be a number representing the unique ID of the question.```/question/random```Show a question that the user has not seen yet. On answer submission, show the user another new question.```/results/list```A view containing all survey results. Take note that this is not paged and will load ALL questions at once.```/results/:questionID```The results of a single survey. ":questionID" should be a number representing the unique ID of the question.```/admin/:adminKey```The question administration page. ":adminKey" should be the "admin_key" string returned by the question creation API. This key is only returned upon quesiton creation, so don't lose it!## TODO (Listed in order of priority)* Improve error handling* Implement more stringent methods to prevent users from voting multiple times on questions (IP-based blocking; Passport.JS auth, etc.)* Unit tests* Switch frontend to React.JS* Make better use of Promises* Better visualizations for survey results* Make results graphs update asynchronously## TODO (Maybe)* Multi-question input)* Admin logins* Docker data volume support (persistent databases)* Kubernetes## TODONE* ~~Create easy-deploy code (Docker)~~* ~~Update to ES6 (using the AirBnB es6 style manual)~~* ~~Allow for question deletion~~