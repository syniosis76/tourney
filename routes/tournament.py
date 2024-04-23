from server import app
import tourneyDatabase
import json
import falcon
import persistent
import persistent.list
import transaction
import uuid
from threading import Thread
from routes import gameDate
from datetime import datetime
from datetime import timedelta
from utilities import googleAuthentication

from routes import statistics

class Tournament(persistent.Persistent):
    gradePrefixLength = 2
    
    def __init__(self, id):
        self.id = id
        self.name = None
        self.startDate = None
        self.endDate = None
        self.gameDates = persistent.list.PersistentList()
        self.administrators = persistent.list.PersistentList()
        self.info = ''
        self.webSite = ''
        self.points_win = 3
        self.points_draw = 1
        self.points_loss = 0
        self.points_default = 0
        self.auto_update_team_names = True
        self.publish = True

    def __str__(self):
        return self.name

    def toJson(self, email = None):
        result = {}
        result['id'] = self.id
        result['name'] = self.name
        result['startDate'] = self.startDate
        result['endDate'] = self.endDate
        result['gameDates'] = sorted(self.gameDates, key=lambda gameDate: gameDate.date)        
        result['info'] = self.info
        result['gradePrefixLength'] = self.gradePrefixLength
        canEdit = self.canEdit(email)
        result['canEdit'] = canEdit
        result['administrators'] = self.administrators
        result['webSite'] = self.webSite
        result['points_win'] = self.points_win
        result['points_draw'] = self.points_draw
        result['points_loss'] = self.points_loss
        result['points_default'] = self.points_default        
        result['auto_update_team_names'] = self.auto_update_team_names
        result['publish'] = self.publish
                
        return json.dumps(result)

    def canEdit(self, email):
        return email in self.administrators

    def basicDict(self):
        return { 'id': self.id
            , 'name': self.name
            , 'startDate': self.startDate
            , 'endDate': self.endDate }
    
    def ensureLoaded(self):
        for gamedate in self.gameDates:            
            gamedate.ensureLoaded()
            for pitch in gamedate.pitches:                
                pitch.ensureLoaded()
                for game in pitch.games:
                    game.ensureLoaded()                            
        
        if len(self.administrators) == 0:
            for attempt in transaction.manager.attempts():
                with attempt:
                    self.administrators.append('stacey@verner.co.nz')
                    transaction.commit()

        if not hasattr(self, 'webSite'):
            for attempt in transaction.manager.attempts():
                with attempt:
                    self.webSite = ''
                    transaction.commit()
        
        if not hasattr(self, 'points_win'):
            for attempt in transaction.manager.attempts():
                with attempt:
                    self.points_win = 3
                    self.points_draw = 1
                    self.points_loss = 0
                    self.points_default = 0
                    transaction.commit()

        if not hasattr(self, 'auto_update_team_names'):
            for attempt in transaction.manager.attempts():
                with attempt:
                    self.auto_update_team_names = True
                    transaction.commit()            

        if not hasattr(self, 'publish'):            
            for attempt in transaction.manager.attempts():
                with attempt:
                    self.publish = True
                    transaction.commit()

    def assign(self, tournament):
        if 'name' in tournament: self.name = tournament['name']
        if 'startDate' in tournament: self.startDate = tournament['startDate']
        if 'endDate' in tournament: self.endDate = tournament['endDate']
        if 'gradePrefixLength' in tournament:
            try:
                self.gradePrefixLength = int(tournament['gradePrefixLength'])
            except ValueError:
                pass # Ignore error.
        if 'info' in tournament: self.info = tournament['info']
        if 'administrators' in tournament and len(tournament['administrators']) > 0:
            self.administrators.clear()
            for administrator in tournament['administrators']:
                self.administrators.append(administrator.lower())
        if 'webSite' in tournament:
            self.webSite = tournament['webSite']
        if 'points_win' in tournament:
            self.points_win = int(tournament['points_win'])
        if 'points_draw' in tournament:
            self.points_draw = int(tournament['points_draw'])
        if 'points_loss' in tournament:
            self.points_loss = int(tournament['points_loss'])
        if 'points_default' in tournament:
            self.points_default = int(tournament['points_default'])        
        if 'auto_update_team_names' in tournament:
            self.auto_update_team_names = tournament['auto_update_team_names']
        if 'publish' in tournament:
            self.publish = tournament['publish']

    def should_list(self, search_term):        
        if hasattr(self, 'publish') and self.publish == False:
            return False
                
        if not (search_term == None or search_term == ''):                    
            lower_search_term = search_term.lower()
            return lower_search_term in self.name.lower()

        return True

    def addDate(self):
        for attempt in transaction.manager.attempts():
            with attempt:
                startDate = self.startDate
                if not startDate:
                    startDate = datetime.today()

                startDate = startDate + timedelta(days=len(self.gameDates))

                newDate = gameDate.GameDate(uuid.uuid4())
                newDate.date = startDate 
                self.gameDates.append(newDate)
                transaction.commit()

        return newDate

    def deleteDate(self, date):        
        for attempt in transaction.manager.attempts():
          with attempt:
            self.gameDates.remove(date)
            transaction.commit()

    def ordinalSuffix(self, i):
        j = i % 10
        k = i % 100
        if j == 1 and k != 11:
            return str(i) + 'st'
        elif j == 2 and k != 12:
            return str(i) + 'nd'
        elif j == 3 and k != 13:
            return str(i) + 'rd'
        
        return str(i) + 'th'

    def updateTeamNames(self, group, revert):
        for attempt in transaction.manager.attempts():
            with attempt:
                updateTeams = {}
            
                groupName = group['name']
                groupPrefix = groupName + ' '
                groupSuffix = ' ' + groupName

                teams = group['teams']
                
                for index in range(0, len(teams)):            
                    team = teams[index]
                    position = index + 1
                    
                    ordinal = self.ordinalSuffix(position)

                    groupTeamName = groupPrefix + ordinal
                    teamName = groupTeamName if revert else team['name']
                    updateTeams[groupTeamName] = teamName
                    
                    groupTeamName = ordinal + groupSuffix
                    teamName = groupTeamName if revert else team['name']
                    updateTeams[groupTeamName] = teamName

                    if position == 1:
                        updateTeams[groupPrefix + 'Win'] = groupPrefix + 'Win' if revert else teamName
                        updateTeams[groupPrefix + 'Winner'] = groupPrefix + 'Winner'if revert else teamName
                        updateTeams['Win' + groupSuffix] = 'Win' + groupSuffix if revert else teamName
                        updateTeams['Winner' + groupSuffix] = 'Winner' + groupSuffix if revert else teamName
                    if position == 2:
                        updateTeams[groupPrefix + 'Lose'] = groupPrefix + 'Lose' if revert else teamName
                        updateTeams[groupPrefix + 'Loser'] = groupPrefix + 'Loser' if revert else teamName
                        updateTeams['Lose' + groupSuffix] = 'Lose' + groupSuffix if revert else teamName
                        updateTeams['Loser' + groupSuffix] = 'Loser' + groupSuffix if revert else teamName           

                for gamedate in self.gameDates:            
                    for pitch in gamedate.pitches:                
                        for game in pitch.games:
                            game.updateTeamNames(updateTeams)

                transaction.commit()

    def check_group_complete(self, group_name):
        for gamedate in self.gameDates:
            for pitch in gamedate.pitches:
                for game in pitch.games:
                    if game.group == group_name and game.status != 'complete':
                        return False

        return True

    # Todo: Consider making this multi-threaded
    def check_and_update_team_names(self, game):
        if self.auto_update_team_names and game.status == 'complete':
            group_name = game.group

            if self.check_group_complete(group_name):
                print(f'Group "{group_name}" complete. Automatically updating team names.')
                group_statistics = statistics.Statistics(self)
                group_statistics.calculate(group_name)
                group_statistics.sort()
                result = group_statistics.toJsonObject()

                self.updateTeamNames(result['groups'][0], False)

class tournamentIdRoute:
    def on_get(self, request, response, id):        
        connection = tourneyDatabase.tourneyDatabase()
        try:                                                
            email = googleAuthentication.getAuthenticatedEmail(request.headers)
            if id == 'new':
                tournament = Tournament(uuid.uuid4())
            else:                
                tournament = connection.tournaments.getByShortId(id) 

            if tournament:
                response.text = tournament.toJson(email)            
        finally:
            connection.close()

    def on_delete(self, request, response, id):        
        connection = tourneyDatabase.tourneyDatabase()
        try:                                                
            tournament = connection.tournaments.getByShortId(id) 
            if tournament:            
                connection.tournaments.deleteTournament(tournament)                            
        finally:
            connection.close()

class tournamentRoute: 
    def on_put(self, request, response):
      body = json.loads(request.stream.read())
      
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getById(body['id'])                
          if not tournament:
            tournament = Tournament(body['id'])
            for attempt in transaction.manager.attempts():
              with attempt:
                connection.tournaments.addTournament(tournament)                 
                transaction.commit()
          for attempt in transaction.manager.attempts():
            with attempt:
              tournament.assign(body)
              transaction.commit()
      finally:
          connection.close()

class tournamentAddDateRoute: 
    def on_put(self, request, response, id):  
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getByShortId(id)                
          if tournament:
            tournament.addDate()                       
      finally:
          connection.close()

app.add_route('/data/tournament/{id}', tournamentIdRoute()) 
app.add_route('/data/tournament/', tournamentRoute()) 
app.add_route('/data/tournament/{id}/adddate', tournamentAddDateRoute()) 