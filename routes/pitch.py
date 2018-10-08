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

class PitchIdRoute: 
    def on_put(self, request, response, id, dateId, pitchId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getByShortId(id)                
          if tournament == None:
            response.status = '404 Not Found'
            response.body = '{"message"="Tournament with id ' + id + ' not found."}'              
          else:
            fullDateId = shortuuid.decode(dateId)
            date = next(x for x in tournament.gameDates if x.id == fullDateId)
            if date == None:
                response.status = '404 Not Found'
                response.body = '{"message"="Date with id ' + dateId + ' not found."}'              
            else:
                fullPitchId = shortuuid.decode(pitchId)
                pitch = next(x for x in date.pitches if x.id == fullPitchId)
                if pitch == None:
                    response.status = '404 Not Found'
                    response.body = '{"message"="Pitch with id ' + pitchId + ' not found."}'
                else:
                    print('Pasted: ' + body['mode'] + '\n' + body['clipboardText'])                     
      finally:
          connection.close()

api.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}', PitchIdRoute()) 