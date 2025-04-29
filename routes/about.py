from server import app
import json

name = 'Tourney'
version = '0.9.13'

class about:
    def on_get(self, request, response):
        data = { "name": name, "version": version }
        response.text = json.dumps(data)

app.add_route('/about', about())