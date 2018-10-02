from server import api
import tourneyDatabase
import json
import falcon
import persistent
import transaction
import uuid

class Pitch(persistent.Persistent):
    def __init__(self, id):
        self.id = id
        self.name = None    

    def __str__(self):
        return self.name