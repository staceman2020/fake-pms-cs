REM Description: Pulls the latest changes from the remote repository
git pull

REM update any node modules
call npm install

REM build the project
call npm run build

REM restart the server
npm run ahprod