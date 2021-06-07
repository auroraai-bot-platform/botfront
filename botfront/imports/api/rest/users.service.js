
import { Accounts } from 'meteor/accounts-base';
import { setScopes } from '../../lib/scopes';
import { auditLog } from '../../../server/logger';

export function createUser(user, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const userId = Accounts.createUser({
          email: user.email.trim(),
          profile: {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              preferredLanguage: user.profile.preferredLanguage,
          },
      });

      // set roles
      setScopes(user, userId);
      const result = Promise.await(Accounts.setPassword(userId, password));

      auditLog('Created an user', {
        user: {profile: {firstName: 'rest', lastName: 'api'}, emails: [{address: 'restservice@example.com'}]},
        type: 'create',
        operation: 'user-created',
        after: { user },
        resId: userId,
        resType: 'user',
      });

      return resolve(`Created user: ${user.email}`);
    } catch (error) {
      return reject(error);
    }
  });
}