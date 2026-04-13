export const searchMixin = {
  methods: {
    textMatches: function(text, matchText) {
      if (matchText.length >= 2 && matchText.startsWith('"') && matchText.endsWith('"')) {
        let exactMatch = matchText.slice(1, -1);
        return text === exactMatch;
      }
      return matchText === text || (matchText.length >= 3 && text.includes(matchText));
    },
    searchMatches: function(text, searchText) {
      let result = 0
      if (text && searchText) {                        
        let lowerText = text.toLowerCase();
        let lowerSearchText = searchText.toLowerCase();
        let searchParts = lowerSearchText.split(',')
        for (let index in searchParts) {
          let part = searchParts[index].trim()
          if (this.textMatches(lowerText, part)) {
            result = result | Math.pow(2, index);
          }
        }        
      }
      return result;
    }
  }
};
