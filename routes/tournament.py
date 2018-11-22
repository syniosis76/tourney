from server import api
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
    def __init__(self, id):
        self.id = id
        self.name = None
        self.startDate = None
        self.endDate = None
        self.gameDates = persistent.list.PersistentList()
        self.administrators = persistent.list.PersistentList()
        self.info = ''

    def __str__(self):
        return self.name

    def toJson(self, email = None):
        result = { key: self.__dict__[key] for key in self.__dict__ if not key.startswith('_v_') }
        canEdit = self.canEdit(email)
        result['canEdit'] = canEdit
        if not self.canEdit: result.pop('administrators', None) # Remove administrators from the result.
        return json.dumps(result)

    def canEdit(self, email):
        return email in self.administrators
    
    def ensureLoaded(self):
        if not hasattr(self, 'gameDates'):
            self.gameDates = persistent.list.PersistentList()
            transaction.commit()  
        
        if len(self.gameDates) == 0:
            self.addDate()
            transaction.commit()

        for gamedate in self.gameDates:            
            gamedate.ensureLoaded()
            for pitch in gamedate.pitches:                
                pitch.ensureLoaded()
                for game in pitch.games:
                    game.ensureLoaded()
                    
        if not hasattr(self, 'administrators'):
            self.administrators = persistent.list.PersistentList()
            transaction.commit()
        
        if len(self.administrators) == 0:
            self.administrators.append('stacey@verner.co.nz')
            transaction.commit()

        if not hasattr(self, 'info'):
            self.info = ''
            transaction.commit()

    def assign(self, tournament):
        if 'name' in tournament: self.name = tournament['name']
        if 'startDate' in tournament: self.startDate = tournament['startDate']
        if 'endDate' in tournament: self.endDate = tournament['endDate']
        if 'info' in tournament: self.info = tournament['info']
        if 'administrators' in tournament and len(tournament['administrators']['data']) > 0:
            self.administrators.clear()
            for administrator in tournament['administrators']['data']:
                self.administrators.append(administrator)       

    def addDate(self):
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
            updateTeams[groupTeamName.lower()] = teamName
            
            groupTeamName = ordinal + groupSuffix
            teamName = groupTeamName if revert else team['name']
            updateTeams[groupTeamName.lower()] = teamName

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
            connection.tournaments.addTournament(tournament)                 
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

api.add_route('/data/tournament/{id}', tournamentIdRoute()) 
api.add_route('/data/tournament/', tournamentRoute()) 
api.add_route('/data/tournament/{id}/adddate', tournamentAddDateRoute()) 