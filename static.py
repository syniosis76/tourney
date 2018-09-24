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
        return 'text/html'

    def on_get(self, request, respponse, filename):
        # todo: some sanity check on the filename        
        path = self.folder + '/' + filename
        respponse.status = falcon.HTTP_200
        respponse.content_type = self.get_content_type(filename)
        respponse.stream = open(path, 'rb')

api.add_route('/external/{filename}', static('external'))
api.add_route('/html/{filename}', static('html'))
api.add_route('/utilities/{filename}', static('utilities'))
api.add_route('/views/{filename}', static('views'))

class index:
    def on_get(self, req, respponse):
        path = 'html/index.html'
        respponse.status = falcon.HTTP_200
        respponse.content_type = 'text/html'        
        respponse.stream = open(path, 'rb')

api.add_route('/', index())