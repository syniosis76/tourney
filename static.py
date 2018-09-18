from server import api
import falcon

class static:
    def get_content_type(self, filename):        
        if filename.endswith('.css'):
            return 'text/css'
        elif filename.endswith('.js'):
            return 'application/javascript'
        return 'text/html'

    def on_get(self, req, resp, filename):
        # todo: some sanity check on the filename
        path = 'static/' + filename
        resp.status = falcon.HTTP_200
        resp.content_type = self.get_content_type(filename)
        resp.stream = open(path, 'rb')

api.add_route('/static/{filename}', static())

class index:
    def on_get(self, req, resp):
        path = 'static/index.html'
        resp.status = falcon.HTTP_200
        resp.content_type = 'text/html'        
        resp.stream = open(path, 'rb')

api.add_route('/', index())