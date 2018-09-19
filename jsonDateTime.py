from datetime import datetime
import json

class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return {
                '_type': 'datetime',
                'value': o.isoformat()
            }

        return super().default(o)  

class DateTimeDecoder(json.JSONDecoder):
    def __init__(self, *args, **kwargs):
        json.JSONDecoder.__init__(self, object_hook=self.object_hook, *args, **kwargs)

    def object_hook(self, obj):
        if '_type' not in obj:
            return obj
        type = obj['_type']
        if type == 'datetime':
            return datetime.strptime(obj['value'], '%Y-%m-%dT%H:%M:%S')
        return obj        
        
json._default_encoder = DateTimeEncoder()
json._default_decoder = DateTimeDecoder()
