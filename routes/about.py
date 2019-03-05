from server import api
import json

name = 'Tourney'
version = '0.7.1'

class about:
    def on_get(self, req, resp):
        data = { "name": name, "version": version }
        resp.body = json.dumps(data)

api.add_route('/about', about())