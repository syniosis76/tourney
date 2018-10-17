from server import api
import static
from waitress import serve

from utilities import jsonEncoder

from routes import about
from routes import tournament
from routes import tournaments
from routes import gameDate
from routes import statistics

serve(api, listen='*:8000')