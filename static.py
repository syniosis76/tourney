from server import api
import falcon

class static:
    def __init__(self, folder):
        self.folder = folder

    def get_content_type(self, filename):        
        if filename.endswith('.css'):
            return 'text/css'
        elif filename.endswith('.js'):
            return 'application/javascript'
        elif filename.endswith('.svg'):
            return 'image/svg+xml'
        return 'text/html'

    def on_get(self, request, response, filename):
        # todo: some sanity check on the filename        
        path = self.folder + '/' + filename        
        response.status = falcon.HTTP_200
        response.cache_control = ['no-cache']
        response.content_type = self.get_content_type(filename)
        response.stream = open(path, 'rb')

api.add_route('/external/{filename}', static('external'))
api.add_route('/html/{filename}', static('html'))
api.add_route('/views/{filename}', static('views'))

class index:
    def on_get(self, request, response):
        path = 'html/index.html'
        response.status = falcon.HTTP_200
        response.cache_control = ['no-cache']
        response.content_type = 'text/html'        
        response.stream = open(path, 'rb')

api.add_route('/', index())