from server import app
import json
from utilities import googleAuthentication

class authentication:
    def on_get(self, request, response):
        print('Checking Authentication')       
        info = googleAuthentication.getAuthenticatedInfoFromHeaders(request.headers)
        if info:
            email = info.get('email', None)
            print('Email: ' + email)
            response.text = 'OK ' + email
        else:
            response.text = 'Error'

class authentication_jwt:
    def on_get(self, request, response):
        print('Checking Authentication')       
        info = googleAuthentication.getAuthenticatedInfoFromHeaders(request.headers)
        if info:
            response.text = json.dumps(info)
        else:
            response.text = 'Error'

app.add_route('/authentication', authentication())
app.add_route('/authentication/jwt', authentication_jwt())