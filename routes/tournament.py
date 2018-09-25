import persistent

class Tournament(persistent.Persistent):
    def __init__(self, id, name, startDate, endDate):
        self.id = id
        self.name = name
        self.startDate = startDate
        self.endDate = endDate

    def __str__(self):
        return self.name