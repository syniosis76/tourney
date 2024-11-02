import falcon
import traceback

def genericErrorHandler(request, response, exception, params):
    # Ignore HTTPError and re-raise
    if isinstance(exception, falcon.HTTPError):
        raise exception
    else:
        traceback.print_exc()
        response.status = '500 Unexpected Error'
        response.text = '{"message": "An unexpected error occurred."}'     

app = falcon.App()
app.add_error_handler(Exception, genericErrorHandler)
