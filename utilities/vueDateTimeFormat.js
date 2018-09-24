Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('MMM DD YYYY')
  }
})

Vue.filter('formatDateTime', function(value) {
  if (value) {
    return moment(String(value)).format('MMM DD YYYY hh:mm')
  }
})

Vue.filter('formatTime', function(value) {
  if (value) {
    return moment(String(value)).format('hh:mm')
  }
})