from server import api
import static
from waitress import serve

from routes import about
from routes import tournament
from routes import tournaments

serve(api, listen='*:8000')