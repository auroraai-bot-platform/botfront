import '../imports/api/setup';
import '../imports/lib/aggregate';
import '../imports/api/globalSettings/globalSettings.collection';
import '../imports/api/globalSettings/globalSettings.methods';
import '../imports/api/conversations';
import '../imports/api/core_policies';
import '../imports/api/credentials';
import '../imports/api/endpoints/endpoints.methods';
import '../imports/api/endpoints/endpoints.schema';
import '../imports/api/endpoints/endpoints.collection';
import '../imports/api/instances/instances.collection';
import '../imports/api/instances/instances.methods';
import '../imports/api/instances/instances.schema';
import '../imports/api/nlu_model/nlu_model.collection';
import '../imports/api/nlu_model/nlu_model.schema';
import '../imports/api/nlu_model/nlu_model.methods';
import '../imports/api/nlu_model/nlu_model.utils';
import '../imports/api/project/project.collection';
import '../imports/api/project/project.methods';
import '../imports/api/user/user.methods';
import '../imports/api/user/user.schema';
import '../imports/api/user/user.collection';
import '../imports/api/storyGroups/storyGroups.collection';
import '../imports/api/storyGroups/storyGroups.methods';
import '../imports/api/storyGroups/storyGroups.schema';
import '../imports/api/story/stories.collection';
import '../imports/api/story/stories.methods';
import '../imports/api/story/stories.schema';
import '../imports/api/slots/slots.collection';
import '../imports/api/slots/slots.methods';
import '../imports/api/slots/slots.schema';
import '../imports/lib/scopes';
import '../imports/api/importExport/export.methods';
import '../imports/startup/server/apollo';
import '../imports/api/graphql/botResponses/botResponses.model';
import '../imports/api/graphql/activity/activity.model';
import '../imports/api/graphql/forms/forms.model';
import '../imports/api/roles/roles.publication';
import '../imports/api/roles/roles';

import '../imports/api/rest';

if (!Meteor.isTest) {
    import './migrations';
}
