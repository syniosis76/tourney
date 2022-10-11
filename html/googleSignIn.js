export class GoogleUser {
  constructor() {
    this.status = 'pending';
    this.jwt = null;
    this.description = 'unknown';
    this.isSignedIn = false;    
  }

  appStart() {        
    this.initialise();
  };

  initialise() {
    var _this = this

    try {
      google.accounts.id.initialize({
        client_id: '707719989855-4ih252rblum0eueu7643rqdflmq5h501.apps.googleusercontent.com',
        itp_support: true,
        ux_mode: 'popup',
        callback: (response) => {
          _this.onAuthorise(response);
        }
      });
    } catch (e) {
      console.error(e, e.stack);
    }

    this.refreshValues();
  };

  signIn() {
    var _this = this;
    _this.status = 'pending';
    google.accounts.id.prompt((notification) => {
      console.log('gsi notification')
      console.log(notification);
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {       
        _this.error = notification;
        _this.signOut();
      }
      else
      {
        _this.error = null;
      }
    });
  }

  signOut() {
    this.jwt = null;
    Cookies.remove('google_jwt')
    this.updateGoogleUser();
  }

  onAuthorise(response) {
    console.log(response)        
    this.jwt = response.credential;

    this.updateGoogleUser();        
  }

  refreshValues() {
    console.log('Refreshing values...');
    this.status = 'pending';
    this.jwt = Cookies.get('google_jwt')
    this.updateGoogleUser();      
  }

  getUserInfo() {
    var _this = this;
    oboe({
      method: 'GET',
      url: '/authentication/jwt',
      headers: this.headers
    })      
    .done(function(info)
    {
      console.log('Info ' + info);        
      _this.description = info['full_name'];
      _this.isSignedIn = true;
      _this.status = 'ready';
    })
    .fail(function (error) {
      console.log(error);   
    });
  }

  updateGoogleUser() {
    if (this.jwt) {
      this.headers = { 'Authorization': 'Bearer ' + this.jwt };
      this.getUserInfo()
      Cookies.set('google_jwt', this.jwt)
    } else {
      this.jwt = null;
      this.headers = {};
      this.description = 'unknown';
      this.isSignedIn = false;      
      this.status = 'signedout';
    }

    console.log('Google User: ', this.description)
  }

  checkGoogleUser(onComplete) {    
    this.internalCheckGoogleUser(0, onComplete)
  }

  internalCheckGoogleUser(retryCount, onComplete) {
    try {        
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
    } catch (e) {
      console.error(e, e.stack);
    }
  }
}