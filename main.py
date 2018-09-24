from server import api
import about
import static
import tournaments
from waitress import serve

serve(api, listen='*:8000')