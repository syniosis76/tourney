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
    if result == 0: result = -(team2.values['cardPoints'] - team1.values['cardPoints']) # Lower value is better
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
      resultGroup['hasCompleted'] = getattr(group, 'hasCompleted', len(group.items) > 0)
      resultGroup['hasOnlyDependent'] = getattr(group, 'hasOnlyDependent', False)
      resultTeams = []
      resultGroup['teams'] = resultTeams
      for team in group.items:
        resultTeam = {}
        resultTeams.append(resultTeam)
        resultTeam['name'] = team.name
        resultTeam['points'] = team.values['points']
        resultTeam['goalDifference'] = team.values['goalDifference']
        resultTeam['goalsFor'] = team.values['goalsFor']
        resultTeam['goalsAgainst'] = team.values['goalsAgainst']
        resultTeam['cardPoints'] = team.values['cardPoints']
        resultTeam['played'] = team.values['played']
        #todo verses

    return result

  def clear(self):
    self.groups.clear()

  def isDependentGame(self, game):
    if not game.team1 or not game.team2:
      return True
    team1 = game.team1.strip()
    team2 = game.team2.strip()
    team1Lower = team1.lower()
    team2Lower = team2.lower()
    
    placeSuffixes = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']
    for suffix in placeSuffixes:
      if team1Lower.endswith(suffix) or team2Lower.endswith(suffix):
        return True
    
    dependentWords = ['win', 'lose', 'winner', 'loser', 'champion', 'final', 'semi', 'quarter']
    for word in dependentWords:
      if team1Lower == word or team2Lower == word:
        return True
      if team1Lower.startswith(word + ' ') or team2Lower.startswith(word + ' '):
        return True
      if team1Lower.endswith(' ' + word) or team2Lower.endswith(' ' + word):
        return True
    
    return False

  def calculate(self, group_name = None):
    self.clear()    
    previousGameIndex = 0           
    for gameDate in self.tournament.gameDates:
      maxPitchIndex = 0     
      for pitch in gameDate.pitches:
        gameIndex = previousGameIndex
        for game in pitch.games:          
          if group_name == None or game.group == group_name:
            self.addGame(game, gameIndex)
            gameIndex = gameIndex + 1
          if gameIndex > maxPitchIndex: maxPitchIndex = gameIndex
      previousGameIndex = maxPitchIndex

    self.collectPendingGroups(group_name)

  def collectPendingGroups(self, group_name = None):
    for gameDate in self.tournament.gameDates:
      for pitch in gameDate.pitches:
        for game in pitch.games:
          if group_name == None or game.group == group_name:
            groupName = game.group.strip()
            group = next((x for x in self.groups if x.name == groupName), None)
            if not group:
              group = StatisticsObject()
              group.name = groupName
              group.items = []
              group.values = {}
              group.hasCompleted = False
              group.hasOnlyDependent = True
              group.minIndex = float('inf')
              self.groups.append(group)
            
            if game.hasCompleted:
              group.hasCompleted = True
            if not self.isDependentGame(game):
              group.hasOnlyDependent = False
            
            if game.team1 and game.team1.strip():
              team1Name = game.team1.strip()
              team1 = next((x for x in group.items if x.name == team1Name), None)
              if not team1:
                team1 = StatisticsObject()
                team1.name = team1Name
                team1.items = []
                team1.values = {'points': 0, 'goalDifference': 0, 'goalsFor': 0, 'goalsAgainst': 0, 'cardPoints': 0, 'played': 0}
                group.items.append(team1)
            
            if game.team2 and game.team2.strip():
              team2Name = game.team2.strip()
              team2 = next((x for x in group.items if x.name == team2Name), None)
              if not team2:
                team2 = StatisticsObject()
                team2.name = team2Name
                team2.items = []
                team2.values = {'points': 0, 'goalDifference': 0, 'goalsFor': 0, 'goalsAgainst': 0, 'cardPoints': 0, 'played': 0}
                group.items.append(team2)

  def cardPoints(self, game, team):
    result = 0
    for event in game.eventLog:
      if event.team == team:
        if event.eventType in ['Green Card', 'Yellow Card', 'Red Card']:
          result += 5
        elif event.eventType in ['Ejection Red Card']:
          result += 25

    return result

  def addGame(self, game, gameIndex):     
    if game.hasCompleted:
      self.addResults(gameIndex, game.group.strip(), game.team1.strip(), game.team1Points, game.team1Score, game.team2.strip(), game.team2Points, game.team2Score, self.cardPoints(game, game.team1.strip()))
      self.addResults(gameIndex, game.group.strip(), game.team2.strip(), game.team2Points, game.team2Score, game.team1.strip(), game.team1Points, game.team1Score, self.cardPoints(game, game.team2.strip()))

  def addResults(self, gameIndex, groupName, teamName, points, goalsFor, versesTeamName, versesPoints, goalsAgainst, cardPoints):    
    group = self.getOrAddItem(self.groups, groupName)       
    team = self.getOrAddItem(group.items, teamName)    
    versesTeam = self.getOrAddItem(team.items, versesTeamName)               
				
    if not hasattr(group, 'minIndex') or gameIndex < group.minIndex: group.minIndex = gameIndex

    self.appendValue(team.values, "played", 1)				
    self.appendValue(team.values, "points", points)
    self.appendValue(team.values, "goalDifference", goalsFor - goalsAgainst)
    self.appendValue(team.values, "goalsFor", goalsFor)
    self.appendValue(team.values, "goalsAgainst", goalsAgainst)
    self.appendValue(team.values, "cardPoints", cardPoints)

    self.appendValue(versesTeam.values, "points", points)
    self.appendValue(versesTeam.values, "goalDifference", goalsFor - goalsAgainst)
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