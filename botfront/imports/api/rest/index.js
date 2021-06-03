import { WebApp } from 'meteor/webapp'; 
import express from 'express';
import utilitiesService from './utilities.service';
import usersService from './users.service';
import projectsService from './projects.service';

const app = express();
const restApiToken = process.env.REST_API_TOKEN;

const adminEmail = process.env.ADMIN_USER;
const adminPassword = process.env.ADMIN_PASSWORD;

// create admin on startup
if (adminEmail != null && adminPassword != null) {
  restService.createUser({
    email: adminEmail,
    roles: [{roles: ['global-admin'], project: 'GLOBAL'}],
    profile: {firstName: 'admin', lastName: 'admin', preferredLanguage: 'en'}
  }, adminPassword);
}

app.get('/api', (req, res, next) => {
  res.sendStatus(200);
})

/**
 * @swagger
 *  /api/users:
 *    put:
 *      create a new user
        Interface {
          email: string;
          password: string;
          roles?: [
            {
              roles: string[],
              project: string
            }
          ];
          profile?: {
            firstName: string;
            lastName: string;
            preferredLanguage: string'
          }
        }
 *     
*/
app.put('/api/users', utilitiesService.fetchBodyMW, async(req, res, next) => {
  if (req.headers.authorization !== restApiToken) {
    res.sendStatus(403);
    return;
  }

  const inputs = JSON.parse(req.body);

  if (inputs.email == null || inputs.password == null) {
    res.status(400).send('Missing email or password');
    return;
  }

  if (inputs.roles != null && (!Array.isArray(inputs.roles) || inputs.roles.length < 1)) {
    res.status(400).send('Malformed or missing roles');
    return;
  }

  const user = {
    email: inputs.email,
    roles: inputs.roles ?? [{roles: ['global-admin'], project: 'GLOBAL'}],
    profile: inputs.profile ?? {firstName: 'generated', 'lastName': 'generated', preferredLanguage: 'en'}
  };

  try {
    const success = await usersService.createUser(user, inputs.password);
    res.send(success);
  } catch (error) {
    console.log({error});
    res.status(500).send(error);
  }
});


/**
 * @swagger
 *  /api/projects:
 *    put:
 *      create a new project
        Interface {
          name: string;
          nameSpace: string; // MUST START with `bf-`
          baseUrl: string; // the url under which the rasa bot instance is reachable
        }
 *     
*/
app.put('/api/projects', utilitiesService.fetchBodyMW, (req, res, next) => {
  if (req.headers.authorization !== restApiToken) {
    res.sendStatus(403);
    return;
  }

  const inputs = JSON.parse(req.body);
  
  if (inputs.name == null || typeof inputs.name !== 'string'
    || inputs.nameSpace == null || typeof inputs.nameSpace !== 'string'
    || inputs.baseUrl == null || typeof inputs.baseUrl !== 'string'
  ) {
    res.status(400).send('Malformed or missing inputs');
    return;
  }

  try {
    projectsService.createProject(inputs.name, inputs.nameSpace, inputs.baseUrl);
    res.sendStatus(200);
  } catch (error) {
    console.log({error});
    res.send(error);
  }
});

WebApp.connectHandlers.use(app);

