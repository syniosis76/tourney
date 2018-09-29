from datetime import datetime
import uuid
import shortuuid
import json

class JsonEncoder(json.JSONEncoder):
    def default(self, object):
        if isinstance(object, datetime):
            return {
                '_type': 'datetime',
                'value': object.isoformat()
            }
        elif isinstance(object, uuid.UUID):
            return {
                '_type': 'uuid',
                'value': shortuuid.encode(object)
            }

        return super().default(object)  

class JsonDecoder(json.JSONDecoder):
    def __init__(self, *args, **kwargs):
        json.JSONDecoder.__init__(self, object_hook=self.object_hook, *args, **kwargs)

    def object_hook(self, object):
        if '_type' not in object:
            return object
        type = object['_type']
        if type == 'datetime':
            try:
                return datetime.strptime(object['value'], '%Y-%m-%dT%H:%M:%S') # DateTime
            except ValueError:
                try:
                    return datetime.strptime(object['value'], '%Y-%m-%d') # Date Only
                except ValueError:
                    return datetime.strptime(object['value']) # Any Format
        elif type == 'uuid':
            return shortuuid.decode(object['value'])
        return object        
        
json._default_encoder = JsonEncoder()
json._default_decoder = JsonDecoder()
