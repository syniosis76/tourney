from server import api
import json

name = 'Cities'
version = '0.1.1.1'

class about:
    def on_get(self, req, resp):
        data = { "name": name, "version": version }
        resp.body = json.dumps(data)

api.add_route('/about', about())