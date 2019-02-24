from google.oauth2 import id_token
from google.auth.transport import requests

def getAuthenticatedInfo(token, clientId):
    try:
      info = id_token.verify_oauth2_token(token, requests.Request(), clientId)        

      if info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
        raise ValueError('Wrong issuer.')

      return info
    except ValueError as valueError:
      # Invalid token
      print(valueError)
      pass

    return None

def getAuthenticatedEmail(headers):
    if 'AUTHORIZATION' in headers:
      bearer = headers['AUTHORIZATION']
      token = bearer[7:]

      # Try to authenticate with Web Key.
      info = getAuthenticatedInfo(token, '707719989855-4ih252rblum0eueu7643rqdflmq5h501.apps.googleusercontent.com') # Web Key
      if not info:
        # Try to authenticate with Desktop Key.
        info = getAuthenticatedInfo(token, '707719989855-ha6ob87tlilf123bmfe75g2rd6qu5ld8.apps.googleusercontent.com') # Desktop Key

      if info:
        return info.get('email', None)
    
    return None