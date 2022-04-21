/**
 * Available variables:
 * user - the current user
 * realm - the current realm
 * token - the current token
 * userSession - the current userSession
 * keycloakSession - the current keycloakSession
 */

/**
 * Change value to "true" in order to enable debugging
 * output to /var/log/keycloak/keycloak.log.
 */
var debug = false
var ArrayList = Java.type("java.util.ArrayList");
var policies = new ArrayList();

/**
 * The actual debug output function
 */
function debugOutput(msg) {
    if (debug) print("Debug script mapper: " + msg);
}

/**
 * Helper function to determine **all** roles assigned
 * to a given user, even the indirectly assigned ones
 * (e.g. through group memberships). The built-in method
 * "getRealmRoleMappings" does unfortunately not work
 * here, since it only returns the **directly** assigned
 * roles (see: https://www.keycloak.org/docs-api/<version>/javadocs/org/keycloak/models/RoleMapperModel.html#getRealmRoleMappings--
 * for details).
 */
function getAllUserRoles() {
    var userRoles = [];
    realm.getRoles().forEach(function(role) {
        if(user.hasRole(role)) {
            debugOutput('found role "' + role.getName() + '" assigned to user.');
            userRoles.push(role);
        } else {
            debugOutput('role "' + role.getName() + '" is not assigned to user.');
        }
    });
    return userRoles;
}

/**
 * Check all roles assigned to a given user for a "policy"
 * role attribute. If the role attribute is present, split
 * the value into individual elements and insert each element
 * into the array to be returned.
 */
var roles = getAllUserRoles();
roles.forEach(function(role) {
    var policy = role.getAttribute("policy");
    if (policy.length) {
        debugOutput('attribute "policy" found in role ' + role.getName());
        policy.forEach(function(value) {
            var arrayOfValues = value.replace(/, /g, ',').split(',');
            arrayOfValues.forEach(function(value) {
                debugOutput('adding "policy" attribute value ' + value + ' to array');
                if (policies.indexOf(value) < 0) policies.add(value);
            });
        });
    }
});

/**
 * Return the array populated above to Keycloak
 */
debugOutput('final "policy" array ' + policies);
exports = policies;

