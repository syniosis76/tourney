@echo off

set path=%path%;C:\Program Files\PostgreSQL\10\bin

echo Backup Database
call heroku pg:backups:capture -a cptourney HEROKU_POSTGRESQL_WHITE_URL

echo
echo Download Backup
call heroku pg:backups:download -a cptourney

echo
echo Restore Backup
pg_restore --verbose --clean --no-acl --no-owner -h localhost -p 5433 -U postgres -d tourney-dev latest.dump

echo
echo Copy to dated file
ren latest.dump "%date:~10,4%_%date:~7,2%_%date:~4,2%__%time:~0,2%_%time:~3,2%_%time:~6,2%.dump"

pause