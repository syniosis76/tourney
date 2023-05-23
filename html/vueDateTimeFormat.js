Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('MMM DD YYYY')
  }
})

Vue.filter('formatDayOfYear', function(value) {
  if (value) {
    return moment(String(value)).format('dddd MMM DD YYYY')
  }
})