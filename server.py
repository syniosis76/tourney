import falcon
import traceback

def genericErrorHandler(exception, request, response, params):
    # Ignore HTTPError and re-raise
    if isinstance(exception, falcon.HTTPError):
        raise exception
    else:
        traceback.print_exc()
        response.status = '500 Unexpected Error'
        response.body = '{"message": "An unexpected error occurred."}'     

api = falcon.API()
api.add_error_handler(Exception, genericErrorHandler)
