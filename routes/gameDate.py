from server import app
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
        self.gameTimes = persistent.list.PersistentList()
        self.pitches = persistent.list.PersistentList()

    def __str__(self):
        return str(self.date)

    @staticmethod
    def getGameDate(response, connection, id, dateId):
      tournament = connection.tournaments.getByShortId(id)                
      if not tournament:
        response.status = '404 Not Found'
        response.body = '{"message"="Tournament with id ' + id + ' not found."}'              
      else:
        fullDateId = shortuuid.decode(dateId)
        date = next((x for x in tournament.gameDates if x.id == fullDateId), None)
        if not date:
          response.status = '404 Not Found'
          response.body = '{"message"="Date with id ' + dateId + ' not found."}'              
        else:
          return (tournament, date)

      return (None, None)

    def ensureLoaded(self):        
        gameTime = self.gameTimes.data # pylint: disable=unused-variable

    def addPitch(self): 
        newPitch = pitch.Pitch(uuid.uuid4())
        newPitch.name = 'Pitch ' + str(len(self.pitches) + 1)
        
        self.pitches.append(newPitch)

        return newPitch

    def deleteLastPitch(self):        
        if len(self.pitches) > 1:
            self.pitches.pop()

    def pasteGameTimes(self, text):      
      self.gameTimes.clear()
      lines = text.splitlines()
      for line in lines:        
        self.gameTimes.append(line)

class DateRoute: 
    def on_delete(self, request, response, id, dateId):  
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          (tournament, date) = GameDate.getGameDate(response, connection, id, dateId)
          if date:
              tournament.deleteDate(date)                     
      finally:
          connection.close()

    def on_put(self, request, response, id, dateId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        date = GameDate.getGameDate(response, connection, id, dateId)[1]
        if date:          
          for attempt in transaction.manager.attempts():
            with attempt:
              date.date = body['date']
              transaction.commit()                              
      finally:
        connection.close()

class GameTimePasteRoute: 
    def on_put(self, request, response, id, dateId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        date = GameDate.getGameDate(response, connection, id, dateId)[1]
        if date:
          for attempt in transaction.manager.attempts():
            with attempt:
              date.pasteGameTimes(body['clipboardText'])
              transaction.commit()                    
      finally:
        connection.close()

class PitchRoute: 
    def on_put(self, request, response, id, dateId):  
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          date = GameDate.getGameDate(response, connection, id, dateId)[1]
          if date:
              for attempt in transaction.manager.attempts():
                with attempt:
                  date.addPitch()                
                  transaction.commit()
      finally:
          connection.close()

    def on_delete(self, request, response, id, dateId):  
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          date = GameDate.getGameDate(response, connection, id, dateId)[1]
          if date:
            for attempt in transaction.manager.attempts():
              with attempt:
                date.deleteLastPitch()
                transaction.commit()              
      finally:
          connection.close()    

app.add_route('/data/tournament/{id}/date/{dateId}', DateRoute()) 
app.add_route('/data/tournament/{id}/date/{dateId}/times/paste', GameTimePasteRoute()) 
app.add_route('/data/tournament/{id}/date/{dateId}/pitch', PitchRoute()) 