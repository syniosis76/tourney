from server import api
import tourneyDatabase
import json
import falcon
import persistent
import transaction
import uuid
import shortuuid

class Game(persistent.Persistent):
    def __init__(self, id):        
        self.id = id
        self.group = None    
        self.team1 = None    
        self.team1Score = 0
        self.team1Points = 0
        self.team2 = None                
        self.team2Score = 0        
        self.team2Points = 0
        self.dutyTeam = None
        self.status = 'pending'

    @property
    def hasCompleted(self):        
        return self.status != 'pending' # todo

    def __str__(self):
        return self.name

    @staticmethod
    def getGame(response, connection, id, dateId, pitchId, gameId):
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
            fullGameId = shortuuid.decode(gameId)
            game = next(x for x in pitch.games if x.id == fullGameId)
            if not game:
              response.status = '404 Not Found'
              response.body = '{"message"="Game with id ' + gameId + ' not found."}'
            else:
              return (tournament, date, pitch, game)

      return (None, None, None, None)

    def assign(self, game):
      if 'group' in game: self.group = game['group']
      if 'team1' in game: self.team1 = game['team1']
      if 'team2' in game: self.team2 = game['team2']
      if 'dutyTeam' in game: self.dutyTeam = game['dutyTeam']
      if 'team1Score' in game: self.team1Score = int(game['team1Score'])
      if 'team2Score' in game: self.team2Score = int(game['team2Score'])
      if 'team1Points' in game: self.team1Points = int(game['team1Points'])
      if 'team2Points' in game: self.team2Points = int(game['team2Points'])
      if 'status' in game: self.status = game['status']

    def assignValues(self, values):      
      if len(values) == 4:
        self.group = values[0]
        self.team1 = values[1]
        self.team2 = values[2]
        self.dutyTeam = values[3]
      elif len(values) == 3:
        self.group = values[0]
        self.team1 = values[1]
        self.team2 = values[2]
        self.dutyTeam = None
      elif len(values) == 2:
        self.group = None
        self.team1 = values[0]
        self.team2 = values[1]
        self.dutyTeam = None    

class GameRoute: 
    def on_put(self, request, response, id, dateId, pitchId, gameId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        game = Game.getGame(response, connection, id, dateId, pitchId, gameId)[3]
        if game:
          game.assign(body)
          transaction.commit()                    
      finally:
        connection.close()

api.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}/game/{gameId}', GameRoute()) 
        