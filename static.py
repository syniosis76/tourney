from server import app
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

    def on_get(self, request, response, filename, **kwargs):
        # todo: some sanity check on the filename        
        path = self.folder + '/' + filename        
        response.status = falcon.HTTP_200
        response.cache_control = ['no-cache']
        response.content_type = self.get_content_type(filename)
        response.stream = open(path, 'rb')

app.add_route('/external/{filename}', static('external'))
app.add_route('/html/{filename}', static('html'))
app.add_route('/html/{filename}/{icon}', static('html')) # To handle SVG Suffix
app.add_route('/views/{filename}', static('views'))

class index:
    def on_get(self, request, response):
        path = 'html/index.html'
        response.status = falcon.HTTP_200
        response.cache_control = ['no-cache']
        response.content_type = 'text/html'        
        response.stream = open(path, 'rb')

app.add_route('/', index())