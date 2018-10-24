class GoogleUser {
  constructor() {
    this.auth2 = null;
    this.googleUser = null;
    this.googleToken = null;
    this.googleUserDescription = 'unknown';
    this.isSignedIn = false;

    this._initSigninV2 = this.initSigninV2.bind(this);
    this._signinChanged = this.signinChanged.bind(this);
    this._userChanged = this.userChanged.bind(this);

    this.app = null;
  }

  appStart() {    
    gapi.load('auth2', this._initSigninV2);
  };

  initSigninV2() {
    this.auth2 = gapi.auth2.init({
        client_id: '707719989855-4ih252rblum0eueu7643rqdflmq5h501.apps.googleusercontent.com',
        scope: 'profile'
    });
    
    this.auth2.isSignedIn.listen(this._signinChanged);
    this.auth2.currentUser.listen(this._userChanged);

    if (this.auth2.isSignedIn.get() == true) {
      this.auth2.signIn();
    }
    this.refreshValues();
  };

  signinChanged(val) {
    console.log('Signin state changed to ', val);
    this.updateGoogleUser();    
  };

  userChanged(user) {
    console.log('User now: ', user);
    this.googleUser = user;
    this.updateGoogleUser(); 
  };

  refreshValues() {
    if (this.auth2){
      console.log('Refreshing values...');
      this.googleUser = this.auth2.currentUser.get();
      this.updateGoogleUser();      
    }
  }

  updateGoogleUser() {
    var wasSignedIn = this.isSignedIn;

    if (this.googleUser && this.googleUser.isSignedIn()) {
      this.googleToken = this.googleUser.getAuthResponse().id_token;    
      var profile = this.googleUser.getBasicProfile();
      this.googleUserDescription = profile.getName();
      this.isSignedIn = true;
      this.headers = { 'Authorization': 'Bearer ' + this.googleToken };
    } else {
      this.googleToken = null;
      this.googleUserDescription = 'unknown';
      this.isSignedIn = false;
      this.headers = {};
    }

    console.log('Google User: ', this.googleUserDescription)
  }
}
