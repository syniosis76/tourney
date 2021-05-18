from server import app
import tourneyDatabase
import json
import falcon
import persistent
import persistent.list
import transaction
import uuid
from routes import gameDate
from datetime import datetime
from datetime import timedelta
from utilities import googleAuthentication

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
                response.body = tournament.toJson(email)            
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