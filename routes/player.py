import persistent

class Player(persistent.Persistent):    
    def __init__(self, grade, team, number, player):
        self.grade = grade
        self.team = team
        self.number = number
        self.player = player