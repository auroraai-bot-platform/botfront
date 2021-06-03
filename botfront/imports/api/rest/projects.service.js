
import { auditLog } from '../../../server/logger';
import { getDefaultDefaultDomain, Projects } from '../project/project.collection';

import { createEndpoints } from '../endpoints/endpoints.methods';
import { Credentials } from '../credentials';
import { createPolicies } from '../core_policies';
import { StoryGroups } from '../storyGroups/storyGroups.methods';

import { Instances } from '../instances/instances.collection';

import AnalyticsDashboards from '../graphql/analyticsDashboards/analyticsDashboards.model';
import { defaultDashboard } from '../graphql/analyticsDashboards/generateDefaults';
import { getUser } from './utilities.service';

import { ENVIRONMENT_OPTIONS } from '../../ui/components/constants.json';


export async function createProject(name, nameSpace, baseUrl) {

  const item = {
    disabled: false,
    name: name,
    namespace: nameSpace,
    defaultLanguage: 'en'
  };

  let _id;
    try {
      _id = insertProject(item);
      console.log({_id});
      AnalyticsDashboards.create(defaultDashboard({ _id, ...item }));
      createEndpoints({ _id, ...item });
      createCredentials(_id, baseUrl);
      createPolicies({ _id, ...item });
      await createNLUInstance({ _id, ...item }, baseUrl);
      auditLog('Created project', {
          user: getUser(),
          resId: _id,
          type: 'created',
          operation: 'project-created',
          after: { project: item },
          resType: 'project',
      });
      return _id;
  } catch (error) {
      console.log({error});
  }
}

function insertProject(item) {
  const projectId = Projects.insert({
    ...item,
    defaultDomain: { content: getDefaultDefaultDomain() },
    chatWidgetSettings: {
      title: item.name,
      subtitle: 'Happy to help',
      inputTextFieldHint: 'Type your message...',
      initPayload: '/get_started',
      hideWhenNotConnected: true,
    },
  });

  return projectId;
}

function createCredentials(projectId, baseUrl) {
  const credentials = `rasa_addons.core.channels.webchat.WebchatInput:
  session_persistence: true
  base_url: '${baseUrl}'
  socket_path: /socket.io/
  rasa_addons.core.channels.bot_regression_test.BotRegressionTestInput: {}`;

  ENVIRONMENT_OPTIONS.forEach(environment => Credentials.insert({
    projectId,
    environment,
    credentials: credentials,
  }));
}

function createStoriesWithTriggersGroup(projectId) {
  storyGroup = {
    name: 'Stories with triggers',
    projectId,
    smartGroup: { prefix: 'withTriggers', query: '{ "rules.0": { "$exists": true } }' },
    isExpanded: true,
    pinned: true,
  };

  createStoryGroup(projectId, storyGroup);
}

function createUnpublishedStoriesGroup(projectId) {
  const storyGroup = {
    name: 'Unpublished stories',
    projectId,
    smartGroup: { prefix: 'unpublish', query: '{ "status": "unpublished" }' },
    isExpanded: false,
    pinned: true,
  };

  createStoryGroup(projectId, storyGroup);
}

function createStoryGroup(projectId, storyGroup) {
  try {
    const id = StoryGroups.insert({
        ...storyGroup,
        children: [],
    });
    const $position = 0;

    Projects.update(
        { _id: projectId },
        { $push: { storyGroups: { $each: [id], $position } } },
    );
    auditLogIfOnServer('Created a story group', {
        resId: id,
        user: getUser(),
        projectId: storyGroup.projectId,
        type: 'created',
        operation: 'story-group-created',
        after: { storyGroup },
        resType: 'story-group',
    });
    return id;
  } catch (error) {
      console.log({error});
  }
}

function createNLUInstance(project, host) {
  return Instances.insert({
    name: 'Default Instance',
    host: host.replace(/{PROJECT_NAMESPACE}/g, project.namespace),
    projectId: project._id,
  });
}