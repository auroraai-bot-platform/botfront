
import { auditLog } from '../../../server/logger';
import { getDefaultDefaultDomain, Projects } from '../project/project.collection';

import { createEndpoints } from '../endpoints/endpoints.methods';
import { createCredentials } from '../credentials';
import { createPolicies } from '../core_policies';
import {
    createDefaultStoryGroup,
    createFailingTestsGroup,
    StoryGroups
} from '../storyGroups/storyGroups.methods';

import { createInstance } from '../instances/instances.methods';

import AnalyticsDashboards from '../graphql/analyticsDashboards/analyticsDashboards.model';
import { defaultDashboard } from '../graphql/analyticsDashboards/generateDefaults';
import { getUser } from './utilities.service';


export async function createProject() {
  const item = {
    disabled: false,
    name: 'test',
    namespace: 'bf-namespace1',
    defaultLanguage: 'en'
  };

  let _id;
    try {
      _id = insertProject(item);
      console.log({_id});
      AnalyticsDashboards.create(defaultDashboard({ _id, ...item }));
      createEndpoints({ _id, ...item });
      createCredentials({ _id, ...item });
      createPolicies({ _id, ...item });
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