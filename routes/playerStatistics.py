from server import api
import tourneyDatabase
import transaction
import functools
import json
import shortuuid
from utilities import googleAuthentication

class PlayerStatisticsObject():
  pass

class PlayerStatistics:
  def __init__(self, tournament):        
        self.grades = []
        self.tournament = tournament

  def __str__(self):
    result = ''
    for grades in self.grades:
      result += grades.name + '\n'
      for team in grades.items:
        result += '  ' + team.name + ' ' + str(team.values['points']) + ' ' + str(team.values['goalDifference']) + ' ' + str(team.values['goalsFor']) + '\n'

    return result

  def toJsonObject(self):
    result = {}
    result['id'] = shortuuid.encode(self.tournament.id)
    result['name'] = self.tournament.name    
    resultGrades = []
    result['grades'] = resultGrades

    for grade in self.grades:
      resultGrade = {}
      resultGrades.append(resultGrade) 
      resultGrade['name'] = grade.name
      resultPlayers = []
      resultGrade['players'] = resultPlayers
      for teamPlayer in grade.items:
        resultPlayer = {}
        resultPlayers.append(resultPlayer)
        resultPlayer['team'] = teamPlayer.teamName
        resultPlayer['player'] = teamPlayer.playerName
        resultPlayer['goals'] = teamPlayer.values.get('goals', 0)
        resultPlayer['greenCards'] = teamPlayer.values.get('Green Card', 0)
        resultPlayer['yellowCards'] = teamPlayer.values.get('Yellow Card', 0)
        resultPlayer['redCards'] = teamPlayer.values.get('Red Card', 0)

    return result

  def clear(self):
    self.grades.clear()

  def calculate(self):
    self.clear()     
    for gameDate in self.tournament.gameDates:    
      for pitch in gameDate.pitches:
        for game in pitch.games:
          self.addGameEvents(game)          
  
  def addGameEvents(self, game):
    lastTeamGoalPlayer = {}

    for logEvent in game.eventLog:        
      if (logEvent.team):  
        gradeName = game.group[:self.tournament.gradePrefixLength]    
        grade = self.getOrAddItem(self.grades, gradeName)
        
        eventType = logEvent.eventType

        teamName = logEvent.team

        playerName = logEvent.player

        if eventType == 'No Goal':
          playerName = lastTeamGoalPlayer.get(teamName, None)

        if playerName:        
          teamPlayerName = teamName + ':/:' + playerName

          teamPlayer = self.getOrAddItem(grade.items, teamPlayerName)
          teamPlayer.teamName = teamName
          teamPlayer.playerName = playerName

          if eventType == 'Goal':
            lastTeamGoalPlayer[teamName] = playerName  
            self.appendValue(teamPlayer.values, "goals", 1)
          elif eventType == 'No Goal':
            self.appendValue(teamPlayer.values, "goals", -1)
          else:
            self.appendValue(teamPlayer.values, eventType, 1)

  def getOrAddItem(self, items, itemName):
    lowerItemName = itemName.lower()
    item = next((x for x in items if x.name.lower() == lowerItemName), None)    
    if not item:
      item = PlayerStatisticsObject()
      item.name = itemName
      item.items = []
      item.values = {}
      items.append(item)
    return item

  def appendValue(self, item, valueName, value):
    if not valueName in item: item[valueName] = 0
    if value != None: item[valueName] = item[valueName] + value

  def sort(self):                                
    self.grades.sort(key=lambda grade: grade.name)

    for grades in self.grades:
      grades.items.sort(key=lambda teamPlayer: teamPlayer.values.get('goals', 0), reverse=True)

class playerStatisticsRoute:
    cache = {}

    def on_get(self, request, response, id):  
      connection = tourneyDatabase.tourneyDatabase()
      try:
          email = googleAuthentication.getAuthenticatedEmail(request.headers)                                                
          tournament = connection.tournaments.getByShortId(id)                
          if tournament:            
            #if not tournament._v_modified and tournament.id in statisticsRoute.cache:
            #  result = statisticsRoute.cache[tournament.id]
            #else:            
            statistics = PlayerStatistics(tournament)
            statistics.calculate()
            statistics.sort()
            result = statistics.toJsonObject()
            #statisticsRoute.cache[tournament.id] = result

            result['canEdit'] = tournament.canEdit(email)
            response.body = json.dumps(result)
      finally:
          connection.close()

api.add_route('/data/tournament/{id}/playerstatistics', playerStatisticsRoute()) 