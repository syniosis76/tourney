from server import api
import tourneyDatabase
import json
import falcon
import persistent
import transaction
import uuid
import shortuuid

class Pitch(persistent.Persistent):
    def __init__(self, id):
        self.id = id
        self.name = None    

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
        date = next(x for x in tournament.gameDates if x.id == fullDateId)
        if not date:
          response.status = '404 Not Found'
          response.body = '{"message"="Date with id ' + dateId + ' not found."}'              
        else:
          fullPitchId = shortuuid.decode(pitchId)
          pitch = next(x for x in date.pitches if x.id == fullPitchId)
          if not pitch:
            response.status = '404 Not Found'
            response.body = '{"message"="Pitch with id ' + pitchId + ' not found."}'
          else:
            return (tournament, date, pitch)

      return (None, None, None)

    def pasteGames(self, mode, text):
      pass

class PitchPasteRoute: 
    def on_put(self, request, response, id, dateId, pitchId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        pitch = Pitch.getPitch(response, connection, id, dateId, pitchId)[2]
        if pitch:
          pitch.pasteGames(body['mode'], body['clipboardText'])                     
      finally:
        connection.close()

api.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}/paste', PitchPasteRoute()) 