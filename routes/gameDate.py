from server import api
import tourneyDatabase
import json
import falcon
import persistent
import persistent.list
import transaction
import uuid
import shortuuid
from routes import pitch

class GameDate(persistent.Persistent):
    def __init__(self, id):
        self.id = id
        self.date = None
        self.pitches = persistent.list.PersistentList()   

    def __str__(self):
        return str(self.date)

    def ensurePitches(self):
        if not hasattr(self, 'pitches'):
            self.pitches = persistent.list.PersistentList()
            transaction.commit()

    def ensurePitch(self):
        self.ensurePitches()
        if len(self.pitches) == 0:
            self.addPitch()
            transaction.commit()

    def addPitch(self): 
        self.ensurePitches()

        newPitch = pitch.Pitch(uuid.uuid4())
        newPitch.name = 'Pitch ' + str(len(self.pitches) + 1)
        
        self.pitches.append(newPitch)
        transaction.commit()

        return newPitch

    def deleteLastPitch(self):
        self.ensurePitches()

        if len(self.pitches) > 1:
            self.pitches.pop()
            transaction.commit()

class DateRoute: 
    def on_delete(self, request, response, id, dateId):  
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getByShortId(id)                
          if tournament == None:
            response.status = '404 Not Found'
            response.body = 'Tournament with id ' + id + ' not found.'              
          else:
            fullDateId = shortuuid.decode(dateId)
            date = next(x for x in tournament.gameDates.data if x.id == fullDateId)
            if date == None:
                response.status = '404 Not Found'
                response.body = 'Date with id ' + dateId + ' not found.'              
            else:
                tournament.deleteDate(date)         
      finally:
          connection.close()

class PitchRoute: 
    def on_put(self, request, response, id, dateId):  
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getByShortId(id)                
          if tournament == None:
            response.status = '404 Not Found'
            response.body = 'Tournament with id ' + id + ' not found.'              
          else:
            fullDateId = shortuuid.decode(dateId)
            date = next(x for x in tournament.gameDates.data if x.id == fullDateId)
            if date == None:
                response.status = '404 Not Found'
                response.body = 'Date with id ' + dateId + ' not found.'              
            else:
                date.addPitch()                
      finally:
          connection.close()

    def on_delete(self, request, response, id, dateId):  
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getByShortId(id)                
          if tournament == None:
            response.status = '404 Not Found'
            response.body = 'Tournament with id ' + id + ' not found.'              
          else:
            fullDateId = shortuuid.decode(dateId)
            date = next(x for x in tournament.gameDates.data if x.id == fullDateId)
            if date == None:
                response.status = '404 Not Found'
                response.body = 'Date with id ' + dateId + ' not found.'              
            else:
                date.deleteLastPitch()                
      finally:
          connection.close()

api.add_route('/data/tournament/{id}/date/{dateId}', DateRoute()) 
api.add_route('/data/tournament/{id}/date/{dateId}/pitch', PitchRoute()) 