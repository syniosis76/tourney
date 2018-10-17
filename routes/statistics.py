from server import api
import tourneyDatabase


class StatisticsObject():
    pass

class Statistics:
  def __init__(self):        
        self.groups = []

  def clear(self):
    self.groups.clear()

  def addTournament(self, tournament):
    previousGameIndex = 0           
    for gameDate in tournament.gameDates:
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
      self.addResults(gameIndex, game.group, game.team1, game.team1Points, game.team1Score, game.team2, game.team2Points, game.team2Score)
      self.addResults(gameIndex, game.group, game.team2, game.team2Points, game.team2Score, game.team1, game.team1Points, game.team1Score)

  def addResults(self, gameIndex, groupName, teamName, points, goalsFor, versesTeamName, versesPoints, versesGoalsFor):
    group = self.getOrAddItem(self.groups, groupName)       
    team = self.getOrAddItem(group.items, teamName)    
    versesTeam = self.getOrAddItem(team.items, versesTeamName)               
				
    if not hasattr(group, 'minIndex') or gameIndex < group.minIndex: group.minIndex = gameIndex

    self.appendValue(team.values, "played", 1)				
    self.appendValue(team.values, "points", points)
    self.appendValue(team.values, "goalDifference", goalsFor - versesGoalsFor)
    self.appendValue(team.values, "goalsFor", goalsFor)

    self.appendValue(versesTeam.values, "points", points)
    self.appendValue(versesTeam.values, "goalDifference", goalsFor - versesGoalsFor)
    self.appendValue(versesTeam.values, "versesPoints", versesPoints)

  def getOrAddItem(self, items, itemName):
    item = next((x for x in items if x.name == itemName), None)    
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

    '''for (var poolIndex = 0; poolIndex < pools.length; poolIndex++)                  
        var pool = pools[poolIndex]                                        
        
        var teams = pool.items

        // Sort the teams by Points, Goal Difference, Goals For, and Verses Results
        teams.sort(function (team1, team2)
        {
            var result = team2.points - team1.points
            if (result == 0) result = team2.goalDifference - team1.goalDifference
            if (result == 0) result = team2.goalsFor - team1.goalsFor
            if (result == 0)
            {
                // Compare the vs results.
                var versesTeam = team2.items.find(function (findItem) { return findItem.name === team1.name; })
                if (versesTeam != undefined)
                {
                    result = versesTeam.points - versesTeam.versesPoints
                    if (result == 0) result = versesTeam.goalDifference
                }
            }

            return result
        });'''   

class statisticsRoute: 
    def on_get(self, request, response, id):  
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getByShortId(id)                
          if tournament:
            statistics = Statistics()
            statistics.addTournament(tournament)
            statistics.sort()
      finally:
          connection.close()

api.add_route('/data/tournament/{id}/statistics', statisticsRoute()) 