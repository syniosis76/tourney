from google.oauth2 import id_token
from google.auth.transport import requests

def getAuthenticatedInfo(headers):
    try:
      if 'AUTHORIZATION' in headers:
        bearer = headers['AUTHORIZATION']
        token = bearer[7:]
        clientId = '707719989855-4ih252rblum0eueu7643rqdflmq5h501.apps.googleusercontent.com'
        
        info = id_token.verify_oauth2_token(token, requests.Request(), clientId)        

        if info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
          raise ValueError('Wrong issuer.')

        return info
    except ValueError:
      # Invalid token
      pass

    return None

def getAuthenticatedEmail(headers):
    info = getAuthenticatedInfo(headers)
    if info:
      return info['email']
    
    return None