from server import app
import json

name = 'Tourney'
version = '0.9.9'

class about:
    def on_get(self, req, resp):
        data = { "name": name, "version": version }
        resp.body = json.dumps(data)

app.add_route('/about', about())