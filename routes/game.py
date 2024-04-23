from server import app
import tourneyDatabase
import json
import falcon
import persistent
import transaction
import uuid
import shortuuid
from utilities import googleAuthentication
from datetime import datetime

class GameEvent(persistent.Persistent):
    def __init__(self, id):        
        self.id = id        
        self.time = None    
        self.eventType = None    
        self.team = None
        self.teamOriginal = None
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
        self.team1Defaulted = False
        self.team2Defaulted = False
        self._v_tournament_id = None

    @property
    def hasCompleted(self):        
        return self.status in ['complete']

    def __str__(self):
        return self.group + ' ' + self.team1 + ' ' + self.team2

    def ensureLoaded(self):
      if not hasattr(self, 'eventLog'):
        print('Adding Event Log')
        for attempt in transaction.manager.attempts():
          with attempt:
            self.eventLog = persistent.list.PersistentList()
            transaction.commit()
      if not hasattr(self, 'team1Defaulted'):        
        for attempt in transaction.manager.attempts():
          with attempt:
            self.team1Defaulted = False
            self.team2Defaulted = False
            transaction.commit()
    
    def ensureLoadedEventLog(self):      
      for item in self.eventLog:
        time = item.time

    @staticmethod
    def getPitch(response, connection, id, dateId, pitchId):
      tournament = connection.tournaments.getByShortId(id)                
      if not tournament:
        response.status = '404 Not Found'
        response.text = '{"message"="Tournament with id ' + id + ' not found."}'              
      else:
        fullDateId = shortuuid.decode(dateId)
        date = next((x for x in tournament.gameDates if x.id == fullDateId), None)
        if not date:
          response.status = '404 Not Found'
          response.text = '{"message"="Date with id ' + dateId + ' not found."}'              
        else:
          fullPitchId = shortuuid.decode(pitchId)
          pitch = next((x for x in date.pitches if x.id == fullPitchId), None)
          if not pitch:
            response.status = '404 Not Found'
            response.text = '{"message"="Pitch with id ' + pitchId + ' not found."}'
          else:
            return (tournament, date, pitch)

      return (None, None, None)

    @staticmethod
    def getGame(response, connection, id, dateId, pitchId, gameId):
      (tournament, date, pitch) = Game.getPitch(response, connection, id, dateId, pitchId)
      if pitch:
        fullGameId = shortuuid.decode(gameId)
        game = next((x for x in pitch.games if x.id == fullGameId), None)
        if not game:
          response.status = '404 Not Found'
          response.text = '{"message"="Game with id ' + gameId + ' not found."}'
        else:
          game._v_tournament_id = id
          return (tournament, date, pitch, game)

      return (None, None, None, None)

    @property
    def tournament(self):
      connection = tourneyDatabase.tourneyDatabase()
      return connection.tournaments.getByShortId(self._v_tournament_id)

    def strip(self, value):
        return (value if value else '').strip()

    def assign(self, game):
      if 'group' in game: self.group = game['group'].strip()
      if 'team1' in game:
          self.team1 = game['team1'].strip()
          if not self.team1Original: self.team1Original = game['team1'].strip()
      if 'team1Original' in game: self.team1Original = game['team1Original'].strip()
      if 'team1Score' in game: self.team1Score = int(game['team1Score'])
      if 'team1Points' in game: self.team1Points = int(game['team1Points'])
      if 'team1Defaulted' in game: self.team1Defaulted = game['team1Defaulted'] == True
      if 'team2' in game:
          self.team2 = game['team2'].strip()
          if not self.team2Original: self.team2Original = game['team2'].strip()
      if 'team2Original' in game: self.team2Original = game['team2Original'].strip()
      if 'team2Score' in game: self.team2Score = int(game['team2Score'])
      if 'team2Points' in game: self.team2Points = int(game['team2Points'])
      if 'team2Defaulted' in game: self.team2Defaulted = game['team2Defaulted'] == True
      if 'dutyTeam' in game:
          self.dutyTeam = self.strip(game['dutyTeam'])
          if not self.dutyTeamOriginal: self.dutyTeamOriginal = self.strip(game['dutyTeam'])
      if 'dutyTeamOriginal' in game: self.dutyTeamOriginal = self.strip(game['dutyTeamOriginal'])
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
      # self.eventLog[:] = [item for item in self.eventLog if item.isInternal and externalEventsOnly]
      self.eventLog.clear()

    def addLogEvent(self, time, eventType, team, player, notes):
      gameEvent = GameEvent(uuid.uuid4())
      gameEvent.time = time
      gameEvent.eventType = eventType      
      gameEvent.team = team
      gameEvent.teamOriginal = team
      gameEvent.player = player
      gameEvent.notes = notes

      self.eventLog.append(gameEvent)

      return gameEvent

    def calculatePoints(self):
      if self.hasCompleted:
        tournament = self.tournament
        if self.team1Defaulted and self.team2Defaulted:
          self.team1Points = tournament.points_default
          self.team2Points = tournament.points_default
        elif self.team1Defaulted:
          self.team1Points = tournament.points_default
          self.team2Points = tournament.points_win
        elif self.team2Defaulted:
          self.team1Points = tournament.points_win
          self.team2Points = tournament.points_default
        elif self.team1Score > self.team2Score:
          self.team1Points = tournament.points_win
          self.team2Points = tournament.points_loss
        elif self.team1Score < self.team2Score:
          self.team1Points = tournament.points_loss
          self.team2Points = tournament.points_win
        else:
          self.team1Points = tournament.points_draw
          self.team2Points = tournament.points_draw
      else:
        self.team1Points = 0
        self.team2Points = 0

    def getReplacementName(self, name, original, teams):
      lowerName = name.lower() if name else None 
      lowerOriginal = original.lower() if original else None

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

      for event in self.eventLog:
        if event.team:
          (original, name) = self.getReplacementName(event.team, getattr(event, 'teamOriginal', ''), teams)      
          if name:
            event.team = name
            event.teamOriginal = original
    
    def get_game_history(self, version):
        size = 999999999999

        game_history = self._p_jar._storage.history(self._p_oid, size=size)
        hgame = game_history[int(version)]
        hgame_time = datetime.fromtimestamp(hgame['time']).strftime("%Y-%m-%d %H:%M:%S")
        hgame_tid = hgame['tid']
        hgame_state = self._p_jar.oldstate(self, hgame_tid)

        event_history = self._p_jar._storage.history(self.eventLog._p_oid, size=size)
        hevent = event_history[int(version)]
        #hevent_time = datetime.fromtimestamp(hevent['time'])
        hevent_tid = hevent['tid']
        hevent_state = self._p_jar.oldstate(self.eventLog, hevent_tid)
        hevent_data = hevent_state['data']
        # Force object to load.
        for item in hevent_data:
          time = item.time

        hgame_state['eventLog'] = hevent_data

        return {'time': hgame_time, 'game': hgame_state}

class GameRoute: 
    def on_get(self, request, response, id, dateId, pitchId, gameId):
      print('Reading Game: ' + id + '/' + dateId + '/' + pitchId + '/' + gameId)
      connection = tourneyDatabase.tourneyDatabase()
      try:
        email = googleAuthentication.getAuthenticatedEmail(request.headers)                                                                        
        print('Email: ' + str(email))
        (tournament, gameDate, pitch, game) = Game.getGame(response, connection, id, dateId, pitchId, gameId) # pylint: disable=unused-variable
        if game: # and tournament.canEdit(email):
          game.ensureLoadedEventLog()
          response.text = json.dumps(game)
      finally:
        connection.close()

    def on_put(self, request, response, id, dateId, pitchId, gameId): 
      print('Updating Game: ' + id + '/' + dateId + '/' + pitchId + '/' + gameId)
      body = json.loads(request.stream.read())
      if 'eventLog' in body:
        print('Has eventLog')
      else:
        print('Does not have eventLog')
      connection = tourneyDatabase.tourneyDatabase()
      try:
        email = googleAuthentication.getAuthenticatedEmail(request.headers)                                                                        
        print('Email: ' + str(email))        
        (tournament, gameDate, pitch, game) = Game.getGame(response, connection, id, dateId, pitchId, gameId) # pylint: disable=unused-variable            
        if game: # and tournament.canEdit(email):
          print('Found Game')
          for attempt in transaction.manager.attempts():
            with attempt:
              game.assign(body)
              transaction.commit()
              print('Game updated')
          tournament.check_and_update_team_names(game)
        else:
          print('Game Not Found')          
      finally:
        connection.close() 

class GameHistoryRoute: 
    def on_get(self, request, response, id, dateId, pitchId, gameId, version):
      print('Reading Game History: ' + id + '/' + dateId + '/' + pitchId + '/' + gameId)
      connection = tourneyDatabase.tourneyDatabase()
      try:
        email = googleAuthentication.getAuthenticatedEmail(request.headers)                                                                        
        print('Email: ' + str(email))
        (tournament, gameDate, pitch, game) = Game.getGame(response, connection, id, dateId, pitchId, gameId) # pylint: disable=unused-variable
        if game: # and tournament.canEdit(email):
          game.ensureLoadedEventLog()
          
          history_game = game.get_game_history(version)          

          response.text = json.dumps(history_game)
      finally:
        connection.close()
      
    def on_put(self, request, response, id, dateId, pitchId, gameId, version):
      print('Restoring Game History: ' + id + '/' + dateId + '/' + pitchId + '/' + gameId)
      connection = tourneyDatabase.tourneyDatabase()
      try:
        email = googleAuthentication.getAuthenticatedEmail(request.headers)                                                                        
        print('Email: ' + str(email))
        (tournament, gameDate, pitch, game) = Game.getGame(response, connection, id, dateId, pitchId, gameId) # pylint: disable=unused-variable
        if game: # and tournament.canEdit(email):
          game.ensureLoadedEventLog()

          history_game = game.get_game_history(version)
          json.dumps(history_game) # force data to load

          history_events = history_game['game']['eventLog']

          for attempt in transaction.manager.attempts():
            with attempt:   
              game.clearEventLog(False)              
          
              for event in history_events:
                eventItem = game.addLogEvent(event.time, event.eventType, event.team, event.player, event.notes)
                eventItem.teamOriginal = event.teamOriginal

              transaction.commit()                                        
              print('Game Revision Restored')              

          #response.text = 'OK'          
      finally:
        connection.close()

app.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}/game/{gameId}', GameRoute())
app.add_route('/data/tournament/{id}/date/{dateId}/pitch/{pitchId}/game/{gameId}/history/{version}', GameHistoryRoute())