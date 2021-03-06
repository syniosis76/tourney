export class GoogleUser {
  constructor() {
    this.status = 'pending';

    this.auth2 = null;
    this.googleUser = null;
    this.googleToken = null;
    this.description = 'unknown';
    this.shortDescription = 'unknown';
    this.isSignedIn = false;

    this._initSigninV2 = this.initSigninV2.bind(this);
    this._signinChanged = this.signinChanged.bind(this);
    this._userChanged = this.userChanged.bind(this);        
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
      this.status = 'pending';
      this.googleUser = this.auth2.currentUser.get();
      this.updateGoogleUser();      
    }
  }

  signIn() {
    var _this = this;
    _this.status = 'pending';   
    _this.auth2.signIn().then(function () {
      console.log('User signed in.');
    });
  }

  signOut() {
    var _this = this;
    _this.status = 'pending';
    var auth2 = window.gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      _this.status = 'signedout';
      console.log('User signed out.');
    });
  }

  checkGoogleUser(onComplete) {    
    this.internalCheckGoogleUser(0, onComplete)
  }

  internalCheckGoogleUser(retryCount, onComplete) {
    if (this.isSignedIn) {
      onComplete();
    }
    else if (retryCount > 20) {
      this.status = 'signedout';
      onComplete();
    }
    else {
      var _this = this;              
      window.setTimeout(function() { _this.internalCheckGoogleUser(retryCount + 1, onComplete); }, 250);
    }      
  }

  updateGoogleUser() {
    if (this.googleUser && this.googleUser.isSignedIn()) {
      this.googleToken = this.googleUser.getAuthResponse().id_token;    
      var profile = this.googleUser.getBasicProfile();
      this.description = profile.getName();
      this.shortDescription = profile.getGivenName();
      this.isSignedIn = true;
      this.headers = { 'Authorization': 'Bearer ' + this.googleToken };
      this.status = 'ready';
    } else {
      this.googleToken = null;
      this.description = 'unknown';
      this.shortDescription = 'unknown';
      this.isSignedIn = false;
      this.headers = {};
    }

    console.log('Google User: ', this.description)
  }
}