from datetime import datetime
import uuid
import shortuuid
import json
import persistent
import enum

class JsonEncoder(json.JSONEncoder):
    def default(self, object): # pylint: disable=E0202
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
        elif isinstance(object, persistent.Persistent):
            return object.__dict__

        return super().default(object)  

class JsonDecoder(json.JSONDecoder):
    def __init__(self, *args, **kwargs):
        json.JSONDecoder.__init__(self, object_hook=self.object_hook, *args, **kwargs)

    def object_hook(self, object): # pylint: disable=E0202
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
