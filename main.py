import sys

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
  path = sys.argv[2]  
  tourneyDatabase.tourneyDatabase.path = 'database/' + path + '.cfg'
  serve(app, listen='*:' + port, threads=6)
else:
  print('Invalid Parameters')
  print('Use: python main.py [port] [database]')
  

