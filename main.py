import sys

from server import api
import static
from waitress import serve

from utilities import jsonEncoder

from routes import about
from routes import tournament
from routes import tournaments
from routes import gameDate
from routes import statistics

if len(sys.argv) > 1:
  port = sys.argv[1]
else:
  port = '8000'

serve(api, listen='*:' + port)