from server import api
import json

name = 'Tourney'
version = '0.5.2'

class about:
    def on_get(self, req, resp):
        data = { "name": name, "version": version }
        resp.body = json.dumps(data)

api.add_route('/about', about())