import sys
import os

from server import app
import static
from waitress import serve

from utilities import jsonEncoder

import tourneyDatabase

from routes import about
from routes import tournament
from routes import tournaments
from routes import gameDate
from routes import statistics
from routes import playerStatistics
from routes import authentication

if len(sys.argv) > 2:
    port = sys.argv[1]
    environment_variable = sys.argv[2]
    print(f'{port} {environment_variable}')
    if environment_variable in os.environ:
        database_uri = os.environ[environment_variable]
        print(database_uri)
        tourneyDatabase.tourneyDatabase.database_uri = database_uri
        serve(app, listen='*:' + port, threads=6)
    else:
        print(f'The specified database environment variable "{environment_variable}" does not exist')    
else:
    print('Invalid Parameters')
    print('Use: python main.py [port] [database environment valriable]')
