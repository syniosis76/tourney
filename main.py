from server import api
import about
import static
import data_service
from waitress import serve

serve(api, listen='*:8000')