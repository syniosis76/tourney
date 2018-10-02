from server import api
import tourneyDatabase
import json
import falcon
import persistent
import persistent.list
import transaction
import uuid
from routes import pitch

class GameDate(persistent.Persistent):
    def __init__(self, id):
        self.id = id
        self.date = None
        self.pitches = persistent.list.PersistentList()   

    def __str__(self):
        return str(self.date)

    def addPitch(self):
        self.pitches = persistent.list.PersistentList()   
        if not hasattr(self, 'pitches'):
            self.pitches = persistent.list.PersistentList()

        newPitch = pitch.Pitch(uuid.uuid4())
        newPitch.name = 'Pitch ' + str(self.pitches.count + 1)
        
        self.pitches.append(newPitch)
        transaction.commit()

        return newPitch