from server import app
import tourneyDatabase
import transaction
import functools
import json
import shortuuid
from utilities import googleAuthentication

class StatisticsObject():
  pass

def compareStatisticsTeams(team1, team2):
  result = team2.values['points'] - team1.values['points']
  if result == 0: result = team2.values['goalDifference'] - team1.values['goalDifference']
  if result == 0: result = team2.values['goalsFor'] - team1.values['goalsFor']
  if result == 0:            
    # Compare the vs results.    
    versesTeam = next((x for x in team2.items if x.name == team1.name), None)
    if versesTeam:
      result = versesTeam.values['points'] - versesTeam.values['versesPoints']
      if result == 0: result = versesTeam.values['goalDifference']
  return result

class Statistics:
  def __init__(self, tournament):        
        self.groups = []
        self.tournament = tournament

  def __str__(self):
    result = ''
    for group in self.groups:
      result += group.name + '\n'
      for team in group.items:
        result += '  ' + team.name + ' ' + str(team.values['points']) + ' ' + str(team.values['goalDifference']) + ' ' + str(team.values['goalsFor']) + '\n'

    return result

  def toJsonObject(self):
    result = {}
    result['id'] = shortuuid.encode(self.tournament.id)
    result['name'] = self.tournament.name    
    resultGroups = []
    result['groups'] = resultGroups

    for group in self.groups:
      resultGroup = {}
      resultGroups.append(resultGroup) 
      resultGroup['name'] = group.name
      resultTeams = []
      resultGroup['teams'] = resultTeams
      for team in group.items:
        resultTeam = {}
        resultTeams.append(resultTeam)
        resultTeam['name'] = team.name
        resultTeam['points'] = team.values['points']
        resultTeam['goalDifference'] = team.values['goalDifference']
        resultTeam['goalsFor'] = team.values['goalsFor']
        resultTeam['versesGoalsFor'] = team.values['versesGoalsFor']
        resultTeam['played'] = team.values['played']
        #todo verses

    return result

  def clear(self):
    self.groups.clear()

  def calculate(self):
    self.clear()    
    previousGameIndex = 0           
    for gameDate in self.tournament.gameDates:
      maxPitchIndex = 0     
      for pitch in gameDate.pitches:
        gameIndex = previousGameIndex
        for game in pitch.games:          
          self.addGame(game, gameIndex)
          gameIndex = gameIndex + 1
        if gameIndex > maxPitchIndex: maxPitchIndex = gameIndex
      previousGameIndex = maxPitchIndex

  def addGame(self, game, gameIndex):     
    if game.hasCompleted:
      self.addResults(gameIndex, game.group.strip(), game.team1.strip(), game.team1Points, game.team1Score, game.team2.strip(), game.team2Points, game.team2Score)
      self.addResults(gameIndex, game.group.strip(), game.team2.strip(), game.team2Points, game.team2Score, game.team1.strip(), game.team1Points, game.team1Score)

  def addResults(self, gameIndex, groupName, teamName, points, goalsFor, versesTeamName, versesPoints, versesGoalsFor):    
    group = self.getOrAddItem(self.groups, groupName)       
    team = self.getOrAddItem(group.items, teamName)    
    versesTeam = self.getOrAddItem(team.items, versesTeamName)               
				
    if not hasattr(group, 'minIndex') or gameIndex < group.minIndex: group.minIndex = gameIndex

    self.appendValue(team.values, "played", 1)				
    self.appendValue(team.values, "points", points)
    self.appendValue(team.values, "goalDifference", goalsFor - versesGoalsFor)
    self.appendValue(team.values, "goalsFor", goalsFor)
    self.appendValue(team.values, "versesGoalsFor", versesGoalsFor)

    self.appendValue(versesTeam.values, "points", points)
    self.appendValue(versesTeam.values, "goalDifference", goalsFor - versesGoalsFor)
    self.appendValue(versesTeam.values, "versesPoints", versesPoints)

  def getOrAddItem(self, items, itemName):
    lowerItemName = itemName.lower()
    item = next((x for x in items if x.name.lower() == lowerItemName), None)    
    if not item:
      item = StatisticsObject()
      item.name = itemName
      item.items = []
      item.values = {}
      items.append(item)
    return item

  def appendValue(self, item, valueName, value):
    if not valueName in item: item[valueName] = 0
    if value != None: item[valueName] = item[valueName] + value

  def sort(self):                                
    self.groups.sort(key=lambda x: (x.minIndex, x.name))

    for group in self.groups:
      compare = functools.cmp_to_key(compareStatisticsTeams)
      group.items.sort(key=compare)              

class statisticsRoute:
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
            statistics = Statistics(tournament)
            statistics.calculate()
            statistics.sort()
            result = statistics.toJsonObject()
            #statisticsRoute.cache[tournament.id] = result

            result['canEdit'] = tournament.canEdit(email)
            response.text = json.dumps(result)
      finally:
          connection.close()

    def on_put(self, request, response, id): 
      body = json.loads(request.stream.read()) 
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
        tournament = connection.tournaments.getByShortId(id) 
        if tournament:
          tournament.updateTeamNames(body['group'], body['revert'])                  
      finally:
        connection.close()

app.add_route('/data/tournament/{id}/statistics', statisticsRoute()) 