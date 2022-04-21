# Keycloak Script Providers

## Documentation

See:
[Server Developer Guide - Service Provider Interfaces (SPI) - JavaScript providers](https://www.keycloak.org/docs/latest/server_development/#_script_providers)

on how to prepare the _Keycloak_ script providers for deployment into a _Keycloak_ instance.

## Protocol Mapper

With the so-called _protocol mapper_, _Keycloak_ offers a method for the mapping of arbitrary attributes onto a specific authentication protocol (e.g. _OpenID Connect_) and its protocol specific attributes (e.g. _Claims_ in _OpenID Connect_).

## Script Mapper

If, for a specific use-case, there is no built-in _protocol mapper_ available in _Keycloak_, it is possible to implement a _protocol mapper_ in _JavaScript_. Such a _script mapper_ will be running within the _Keycloak_ application and will be executed via the _Java Nashorn_ scripting interface.

The possibilities for what can be achieved with a _script mapper_ are numerous. The following will only show the general approach with a basic example. It implements a recursive mapper for a role attribute (in this case the attribute `policy`) or rather its values onto the _OpenID Connect_ attribute `policy`.

Unfortunately both the role attribute `policy` as well as the _OpenID Connect_ attribute `policy` are currently hard coded in the _script mapper_, since i couldn't figure out a way to dynamically pass a value from the _Keycloak_ configuration of the script mapper. Such a functionality seems to be only available for _protocol mappers_ implemented in _Java_.

### Development and test

On a _Keycloak_ __test__ or __development__ system edit the file:

```
vi <PATH_TO_KEYCLOAK>/standalone/configuration/profile.properties
```

and set the following parameters:

```
feature.scripts=enabled
feature.upload_scripts=enabled
```

restart the _Keycloak_ application.

After this the different _mapper_ dialogs within whe WebUI of the _Keycloak_ application show an additional entry `Script Mapper` in the drop-down menu `Mapper Type`. If the `Script Mapper` entry is selected, a editor dialog will be presented which can be used for the development and testing of the _script mapper_.

**Attention:** After finishing the development and testing of the _script mapper_ the parameter `feature.upload_scripts` shown above should be disabled again, since it poses a security risk!

### Deployment

For the actual deployment of the previously developed _script mapper_ onto a __production__ _Keycloak_ system the following preparation steps are necessary:

Directory creation:

```
mkdir -p /tmp/script_provider/role_attribute_mapper_policy/META-INF/
```

Copy the source code of the newly developed _script mapper_ and save it into a file:

```
vi /tmp/script_provider/role_attribute_mapper_policy/role_attribute_mapper_policy.js
```

Create a deployment descriptor for the _script mapper_:

```
vi /tmp/script_provider/role_attribute_mapper_policy/META-INF/keycloak-scripts.json
```

File contents:

```
{
    "mappers": [
        {
            "name": "Role Attribute Mapper - policy",
            "fileName": "role_attribute_mapper_policy.js",
            "description": "Maps the 'policy' role attribute to the OIDC token of a user"
        }
    ]
}
```

Pack the _script mapper_ and the deployment descriptor into a deployable JAR file:

```
cd /tmp/script_provider/role_attribute_mapper_policy/
zip -r role_attribute_mapper_policy.jar META-INF/ role_attribute_mapper_policy.js
```

On the _Keycloak_ system edit the file:

```
vi <PATH_TO_KEYCLOAK>/standalone/configuration/profile.properties
```

and set the following parameters:

```
feature.scripts=enabled
```

restart the _Keycloak_ application.

Put the JAR file created above into the directory `<PATH_TO_KEYCLOAK>/standalone/deployments/`. The deployment of the _script mapper_ into the _Keycloak_ application should happen automatically. This can be verified in the _Keycloak_ log file by checking for log lines like:

```
INFO  [org.jboss.as.repository] (DeploymentScanner-threads - 2) WFLYDR0001: Content added at location <PATH_TO_KEYCLOAK>/standalone/data/content/e1/714bbd9b178cd2004d0a2f999584030f06a54c/content
INFO  [org.jboss.as.server.deployment] (MSC service thread 1-1) WFLYSRV0027: Starting deployment of "role_attribute_mapper_policy.jar" (runtime-name: "role_attribute_mapper_policy.jar")
INFO  [org.keycloak.subsystem.server.extension.KeycloakProviderDeploymentProcessor] (MSC service thread 1-2) Deploying Keycloak provider: role_attribute_mapper_policy.jar
INFO  [org.jboss.as.server] (DeploymentScanner-threads - 2) WFLYSRV0010: Deployed "role_attribute_mapper_policy.jar" (runtime-name : "role_attribute_mapper_policy.jar")
```

Within the _Keycloak_ application the availability of the new _script mapper_ can be verified with:
- `Admin` &rarr; `Server Info` &rarr; `Providers` &rarr; `protocol-mapper` &rarr; `script-role_attribute_mapper_policy.js`
- or in one of the different _mapper_ dialogs within whe WebUI of the _Keycloak_ application in the drop-down menu `Mapper Type` as a new entry `Role Attribute Mapper - policy`

