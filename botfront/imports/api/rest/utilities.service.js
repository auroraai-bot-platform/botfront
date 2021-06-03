export function getUser() {
  return {
    profile: {
      firstName: 'rest',
      lastName: 'api'
    },
    emails: [
      {address: 'restservice@example.com'}
    ]
  };
}


export function fetchBodyMW(req, res, next) {
  let body = "";

  req.on('data', Meteor.bindEnvironment(function (data) {
    body += data;
  }));

  req.on('end', Meteor.bindEnvironment(function () {
    req.body = body;
    next();
  }));
}