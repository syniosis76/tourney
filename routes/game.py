from server import api
import tourneyDatabase
import json
import falcon
import persistent
import transaction
import uuid
import shortuuid
from utilities import googleAuthentication

class GameEvent(persistent.Persistent):
    def __init__(self, id):        
        self.id = id        
        self.time = None    
        self.eventType = None    
        self.team = None
        self.player = None
        self.notes = None
        self.isInternal = True

class Game(persistent.Persistent):        
    def __init__(self, id):        
        self.id = id
        self.group = None    
        self.team1 = None    
        self.team1Original = None
        self.team1Score = 0
        self.team1Points = 0
        self.team2 = None
        self.team2Original = None                
        self.team2Score = 0        
        self.team2Points = 0
        self.dutyTeam = None
        self.dutyTeamOriginal = None
        self.status = 'pending'
        self.eventLog = persistent.list.PersistentList()

    @property
    def hasCompleted(self):        
        return self.status != 'pending' # todo

    def __str__(self):
        return self.group + ' ' + self.team1 + ' ' + self.team2

    def ensureLoaded(self):
      if not hasattr(self, 'team1Original'):
          self.team1Original = self.team1
          transaction.commit()
      
      if not hasattr(self, 'team2Original'):
          self.team2Original = self.team2
          transaction.commit()
      
      if not hasattr(self, 'dutyTeamOriginal'):
          self.dutyTeamOriginal = self.dutyTeam
          transaction.commit()

      if hasattr(self, 'team1original'):
          del self.team1original
          transaction.commit()
      
      if hasattr(self, 'team2original'):
          del self.team2original
          transaction.commit()

      if hasattr(self, 'log'):
          del self.log
          transaction.commit()

      if not hasattr(self, 'eventLog'):
        self.eventLog = persistent.list.PersistentList()
        transaction.commit()

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
      if 'group' in game: self.group = game['group'].strip()
      if 'team1' in game:
          self.team1 = game['team1'].strip()
          if not self.team1Original: self.team1Original = game['team1'].strip()
      if 'team1Original' in game: self.team1Original = game['team1Original'].strip()
      if 'team1Score' in game: self.team1Score = int(game['team1Score'])
      if 'team1Points' in game: self.team1Points = int(game['team1Points'])
      if 'team2' in game:
          self.team2 = game['team2'].strip()
          if not self.team2Original: self.team2Original = game['team2'].strip()
      if 'team2Original' in game: self.team2Original = game['team2Original'].strip()
      if 'team2Score' in game: self.team2Score = int(game['team2Score'])
      if 'team2Points' in game: self.team2Points = int(game['team2Points'])
      if 'dutyTeam' in game:
          self.dutyTeam = game['dutyTeam'].strip()
          if not self.dutyTeamOriginal: self.dutyTeamOriginal = game['dutyTeam'].strip()
      if 'dutyTeamOriginal' in game: self.dutyTeamOriginal = game['dutyTeamOriginal'].strip()
      if 'status' in game: self.status = game['status']

      if 'eventLog' in game: self.assignEventLog(game['eventLog'])
      
      self.calculatePoints()

    def assignValues(self, values):      
      if len(values) == 6:
        self.group = values[0].strip()
        self.team1 = values[1].strip()
        self.team1score = values[2]
        self.team2score = values[3]
        self.team2 = values[4].strip()
        self.dutyTeam = values[5].strip()
      if len(values) == 5:
        self.group = values[0].strip()
        self.team1 = values[1].strip()
        self.team1score = values[2]
        self.team2score = values[3]
        self.team2 = values[4].strip()
        self.dutyTeam = None
      if len(values) == 4:
        self.group = values[0].strip()
        self.team1 = values[1].strip()
        self.team2 = values[2].strip()
        self.dutyTeam = values[3].strip()
      elif len(values) == 3:
        self.group = values[0].strip()
        self.team1 = values[1].strip()
        self.team2 = values[2].strip()
        self.dutyTeam = None
      elif len(values) == 2:
        self.group = None
        self.team1 = values[0].strip()
        self.team2 = values[1].strip()
        self.dutyTeam = None

      if not self.team1Original: self.team1Original = self.team1
      if not self.team2Original: self.team2Original = self.team2
      if not self.dutyTeamOriginal: self.dutyTeamOriginal = self.dutyTeam

      self.calculatePoints()

    def assignEventLog(self, eventLog):
      self.clearEventLog(True)
      for logEvent in eventLog:
        self.addLogEvent(logEvent.get('Time', None), logEvent.get('EventType', None), logEvent.get('Team', None), logEvent.get('Player', None), logEvent.get('Notes', None))        

    def clearEventLog(self, externalEventsOnly):
      self.eventLog[:] = [item for item in self.eventLog if item.isInternal and externalEventsOnly]

    def addLogEvent(self, time, eventType, team, player, notes):
      gameEvent = GameEvent(uuid.uuid4())
      gameEvent.time = time
      gameEvent.eventType = eventType      
      gameEvent.team = team
      gameEvent.player = player
      gameEvent.notes = notes

      self.eventLog.append(gameEvent)

    def calculatePoints(self):
      if self.hasCompleted:
        if self.team1Score > self.team2Score:
          self.team1Points = 3
          self.team2Points = 0
        elif self.team1Score < self.team2Score:
          self.team1Points = 0
          self.team2Points = 3
        else:
          self.team1Points = 1
          self.team2Points = 1
      else:
        self.team1Points = 0
        self.team2Points = 0

    def getReplacementName(self, name, original, teams):
      lowerName = name.lower()
      lowerOriginal = original.lower()

      return next(((key, value) for key, value in teams.items() if key.lower() == lowerName or key.lower() == lowerOriginal), (None, None))
      
    def updateTeamNames(self, teams):
      (original, name) = self.getReplacementName(self.team1, self.team1Original, teams)      
      if name:
        self.team1 = name
        self.team1Original = original

      (original, name) = self.getReplacementName(self.team2, self.team2Original, teams)      
      if name:
        self.team2 = name
        self.team2Original = original

      (original, name) = self.getReplacementName(self.dutyTeam, self.dutyTeamOriginal, teams)      
      if name:
        self.dutyTeam = name
        self.dutyTeamOriginal = original

class GameRoute: 
    def on_put(self, request, response, id, dateId, pitchId, gameId): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:
        email = googleAuthentication.getAuthenticatedEmail(request.headers)                                                                
        (tournament, gameDate, pitch, game) = Game.getGame(response, connection, id, dateId, pitchId, gameId)
        if game and tournament.canEdit(email):
          transaction.abort()
          transaction.begin()
          try:          
            game.assign(body)
            transaction.commit()                              
          except:
            transaction.abort()
            raise
      finally:
        connection.close()

api.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}/game/{gameId}', GameRoute())               