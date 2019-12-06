from server import api
import tourneyDatabase
import json
import falcon
import persistent
import transaction
import uuid
import shortuuid
from routes import game

class Pitch(persistent.Persistent):
    def __init__(self, id):
        self.id = id
        self.name = None
        self.games = persistent.list.PersistentList()      
        self.gameTimes = None

    def __str__(self):
        return self.name

    @staticmethod
    def getPitch(response, connection, id, dateId, pitchId):
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
          fullPitchId = shortuuid.decode(pitchId)
          pitch = next((x for x in date.pitches if x.id == fullPitchId), None)
          if not pitch:
            response.status = '404 Not Found'
            response.body = '{"message"="Pitch with id ' + pitchId + ' not found."}'
          else:
            return (tournament, date, pitch)

      return (None, None, None)

    def ensureLoaded(self):        
        pass      

    def getGameTimes(self):
      if hasattr(self, 'gameTimes'):
        return self.gameTimes
      else:
        return None
    
    def clearGames(self):
      self.games.clear()

    def pasteGames(self, mode, text):      
      if mode == 'replace':
        self.clearGames()
      lines = text.splitlines()
      for line in lines:
        parts = line.split('\t')
        gameItem = game.Game(uuid.uuid4())
        gameItem.assignValues(parts)
        self.games.append(gameItem)

    def pasteGameTimes(self, text):      
      if not hasattr(self, 'gameTimes') or self.gameTimes == None:
        self.gameTimes = persistent.list.PersistentList()
      
      self.gameTimes.clear()
      lines = text.splitlines()
      for line in lines:        
        self.gameTimes.append(line)

    def clearGameTimes(self):      
      if hasattr(self, 'gameTimes'):
        self.gameTimes = None

class PitchPasteRoute: 
    def on_put(self, request, response, id, dateId, pitchId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        pitch = Pitch.getPitch(response, connection, id, dateId, pitchId)[2]
        if pitch:
          for attempt in transaction.manager.attempts():
            with attempt:
              pitch.pasteGames(body['mode'], body['clipboardText'])
              transaction.commit()                  
      finally:
        connection.close()

class PitchEditNameRoute: 
    def on_put(self, request, response, id, dateId, pitchId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        pitch = Pitch.getPitch(response, connection, id, dateId, pitchId)[2]
        if pitch:
          for attempt in transaction.manager.attempts():
            with attempt:
              pitch.name = body['name']
              transaction.commit()                              
      finally:
        connection.close()

class GameTimePasteRoute: 
    def on_put(self, request, response, id, dateId, pitchId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        pitch = Pitch.getPitch(response, connection, id, dateId, pitchId)[2]
        if pitch:
          for attempt in transaction.manager.attempts():
            with attempt:
              pitch.pasteGameTimes(body['clipboardText'])
              transaction.commit()                              
      finally:
        connection.close()

class GameTimeClearRoute: 
    def on_put(self, request, response, id, dateId, pitchId): 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        pitch = Pitch.getPitch(response, connection, id, dateId, pitchId)[2]
        if pitch:
          for attempt in transaction.manager.attempts():
            with attempt:
              pitch.clearGameTimes()
              transaction.commit()                              
      finally:
        connection.close()

class GameTimePasteNameRoute: 
    def on_put(self, request, response, id, dateId, pitchId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        pitch = Pitch.getPitch(response, connection, id, dateId, pitchId)[2]
        if pitch:
          for attempt in transaction.manager.attempts():
            with attempt:
              pitch.name = body['clipboardText']
              transaction.commit()                              
      finally:
        connection.close()

api.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}/paste', PitchPasteRoute()) 
api.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}/editname', PitchEditNameRoute())
api.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}/pastegametimes', GameTimePasteRoute()) 
api.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}/cleargametimes', GameTimeClearRoute())