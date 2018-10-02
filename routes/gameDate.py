from server import api
import tourneyDatabase
import json
import falcon
import persistent
import transaction
import uuid

class GameDate(persistent.Persistent):
    def __init__(self, id):
        self.id = id
        self.date = None    

    def __str__(self):
        return str(self.date)