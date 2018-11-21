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
        self._v_modified = False

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

    def commit(self):
        self._v_modified = True
        transaction.commit()
    
    def ensureLoaded(self):
        result = False

        if not hasattr(self, 'gameDates'):
            self.gameDates = persistent.list.PersistentList()
            result = True      
        
        if len(self.gameDates) == 0:
            self.addDate()
            result = True

        for gamedate in self.gameDates:            
            if gamedate.ensureLoaded(): result = True
            for pitch in gamedate.pitches:                
                if pitch.ensureLoaded(): result = True
                for game in pitch.games:
                    if game.ensureLoaded(): result = True
                    
        if not hasattr(self, 'administrators'):
            self.administrators = persistent.list.PersistentList()
            result = True
        
        if len(self.administrators) == 0:
            self.administrators.append('stacey@verner.co.nz')
            result = True

        if not hasattr(self, '_v_modified'):
            self._v_modified = False # Internal, Volatile, not saved.

        if result:
            self.commit()
            print('Loaded Tournament and Applied Changes')

    def assign(self, tournament):
        if 'name' in tournament: self.name = tournament['name']
        if 'startDate' in tournament: self.startDate = tournament['startDate']
        if 'endDate' in tournament: self.endDate = tournament['endDate']
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
        self.commit()

        return newDate

    def deleteDate(self, date):        
        self.gameDates.remove(date)
        self.commit()

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
    
        groupName = group['name'].lower()
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
                updateTeams[groupPrefix + 'win'] = teamName
                updateTeams[groupPrefix + 'winner'] = teamName
                updateTeams['win' + groupSuffix] = teamName
                updateTeams['winner' + groupSuffix] = teamName
            if position == 2:
                updateTeams[groupPrefix + 'lose'] = teamName
                updateTeams[groupPrefix + 'loser'] = teamName
                updateTeams['lose' + groupSuffix] = teamName
                updateTeams['loser' + groupSuffix] = teamName           

        for gamedate in self.gameDates:            
            for pitch in gamedate.pitches:                
                for game in pitch.games:
                    game.updateTeamNames(updateTeams)

        self.commit()


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
          tournament.commit()
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