from server import api
import json
from utilities import googleAuthentication

class authentication:
    def on_get(self, request, response):
        print('Checking Authentication')       
        info = googleAuthentication.getAuthenticatedInfoFromHeaders(request.headers)
        if info:
            email = info.get('email', None)
            print('Email: ' + email)
            response.body = 'OK ' + email
        else:
            response.body = 'Error'

api.add_route('/authentication', authentication())